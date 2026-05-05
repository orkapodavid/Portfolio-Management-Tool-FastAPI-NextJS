import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "../..");
const backendRoot = resolve(frontendRoot, "../fastapi_backend");
const pmtCoreRoot = resolve(frontendRoot, "../pmt_core_pkg");
const binariesDir = resolve(frontendRoot, "src-tauri/binaries");
const tauriTargetDebugDir = resolve(frontendRoot, "src-tauri/target/debug");
const sidecarSourceRoots = [
  join(backendRoot, "app"),
  join(backendRoot, "commands"),
  join(backendRoot, "alembic_migrations"),
  pmtCoreRoot,
];
const sidecarSourceFiles = [
  fileURLToPath(import.meta.url),
  join(backendRoot, "alembic.ini"),
  join(backendRoot, "pyproject.toml"),
  join(backendRoot, "requirements.txt"),
  join(backendRoot, "uv.lock"),
];
const sidecarRelevantExtensions = new Set([
  ".html",
  ".ini",
  ".json",
  ".mako",
  ".py",
  ".txt",
  ".yaml",
  ".yml",
]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

function resolveUvExecutable() {
  if (process.env.UV_BIN) {
    return process.env.UV_BIN;
  }

  const locatorCommand = process.platform === "win32" ? "where" : "which";
  const locatedPath = capture(locatorCommand, ["uv"]);
  return locatedPath.split(/\r?\n/, 1)[0];
}

function buildPyInstallerArgs(tempDir) {
  const separator = process.platform === "win32" ? ";" : ":";
  const appPackageDir = join(backendRoot, "app");
  const emailTemplatesDir = join(backendRoot, "app/email_templates");
  const alembicConfigPath = join(backendRoot, "alembic.ini");
  const alembicMigrationsDir = join(backendRoot, "alembic_migrations");
  const sidecarEntrypoint = join(backendRoot, "commands/run_tauri_sidecar.py");

  return [
    "run",
    "--with",
    "pyinstaller",
    "pyinstaller",
    "--noconfirm",
    "--clean",
    "--onefile",
    "--name",
    "pmt-backend",
    "--distpath",
    join(tempDir, "dist"),
    "--workpath",
    join(tempDir, "build"),
    "--specpath",
    join(tempDir, "build"),
    "--paths",
    backendRoot,
    "--paths",
    pmtCoreRoot,
    "--collect-submodules",
    "app",
    "--collect-submodules",
    "pmt_core",
    "--collect-submodules",
    "aiosqlite",
    "--exclude-module",
    "pyodbc",
    "--add-data",
    `${appPackageDir}${separator}app`,
    "--add-data",
    `${emailTemplatesDir}${separator}app/email_templates`,
    "--add-data",
    `${alembicConfigPath}${separator}.`,
    "--add-data",
    `${alembicMigrationsDir}${separator}alembic_migrations`,
    sidecarEntrypoint,
  ];
}

function latestSourceMtimeMs() {
  let latestMtimeMs = 0;

  const visit = (path) => {
    const stats = statSync(path);

    if (stats.isDirectory()) {
      for (const entry of readdirSync(path)) {
        visit(join(path, entry));
      }
      return;
    }

    if (!sidecarRelevantExtensions.has(extname(path))) {
      return;
    }

    latestMtimeMs = Math.max(latestMtimeMs, stats.mtimeMs);
  };

  for (const path of sidecarSourceRoots) {
    visit(path);
  }

  for (const path of sidecarSourceFiles) {
    latestMtimeMs = Math.max(latestMtimeMs, statSync(path).mtimeMs);
  }

  return latestMtimeMs;
}

function resolveTargetBinaryPath(targetTriple) {
  const extension = process.platform === "win32" ? ".exe" : "";
  return join(binariesDir, `pmt-backend-${targetTriple}${extension}`);
}

function moveSidecarBinary(tempDir, targetTriple) {
  const extension = process.platform === "win32" ? ".exe" : "";
  const sourceBinary = join(tempDir, "dist", `pmt-backend${extension}`);
  const targetBinary = resolveTargetBinaryPath(targetTriple);

  rmSync(targetBinary, { force: true });
  renameSync(sourceBinary, targetBinary);

  return targetBinary;
}

function syncDebugSidecarBinary(targetBinary) {
  const extension = process.platform === "win32" ? ".exe" : "";
  const debugBinary = join(tauriTargetDebugDir, `pmt-backend${extension}`);

  mkdirSync(tauriTargetDebugDir, { recursive: true });
  copyFileSync(targetBinary, debugBinary);

  return debugBinary;
}

export function buildSidecarBinary() {
  const targetTriple = capture("rustc", ["--print", "host-tuple"]);
  const tempDir = mkdtempSync(join(tmpdir(), "pmt-sidecar-build-"));
  const uvExecutable = resolveUvExecutable();
  const targetBinary = resolveTargetBinaryPath(targetTriple);
  const forceRebuild = process.env.PMT_FORCE_REBUILD_SIDECAR === "1";

  if (!forceRebuild) {
    try {
      const targetStats = statSync(targetBinary);
      if (targetStats.mtimeMs >= latestSourceMtimeMs()) {
        syncDebugSidecarBinary(targetBinary);
        console.log(`Reusing existing sidecar binary at ${targetBinary}`);
        return targetBinary;
      }
    } catch {
      // Build the sidecar if the current-platform binary does not exist yet.
    }
  }

  try {
    run(uvExecutable, buildPyInstallerArgs(tempDir), { cwd: backendRoot });
    const targetBinary = moveSidecarBinary(tempDir, targetTriple);
    syncDebugSidecarBinary(targetBinary);
    return targetBinary;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const binaryPath = buildSidecarBinary();
  console.log(`Built sidecar binary at ${binaryPath}`);
}
