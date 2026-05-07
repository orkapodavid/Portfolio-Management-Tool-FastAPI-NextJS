/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { config } = require("dotenv");

config({ path: ".env.local" });

async function main() {
  const openapiOutputFile = process.env.OPENAPI_OUTPUT_FILE ?? "openapi.json";
  const outputPath = path.resolve(openapiOutputFile);

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      `Cannot regenerate client: ${outputPath} not found. Run \`uv run python -m commands.generate_openapi_schema\` from fastapi_backend first.`,
    );
  }

  const result = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "openapi-ts", "--file", "openapi-ts.config.ts"],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
