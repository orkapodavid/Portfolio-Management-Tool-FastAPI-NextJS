# Tauri Desktop Setup

This guide covers the desktop path for the current Next.js 16 +
FastAPI rebuild. Tauri packages a static Next.js export from
`nextjs-frontend/out` and launches the FastAPI API as a PyInstaller
sidecar.

The desktop sidecar listens on `http://127.0.0.1:18475` by default and
uses an app-data SQLite database. Authentication is disabled by default
for the current local desktop and web workflow. Set
`PMT_AUTH_DISABLED=false` and `NEXT_PUBLIC_AUTH_DISABLED=0` when a task
needs to exercise the login and JWT flow.

## Prerequisites

Install the repository dependencies first:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool

cd fastapi_backend
uv sync --all-groups

cd ../nextjs-frontend
pnpm install
```

Desktop builds also need the Tauri platform prerequisites:

- macOS: Xcode or Xcode Command Line Tools. For desktop-only work,
  `xcode-select --install` is enough.
- Windows: Microsoft C++ Build Tools with "Desktop development with
  C++", Microsoft Edge WebView2, and the Rust MSVC toolchain.
- Rust and Cargo available in the shell.
- `uv` available on `PATH`, because `pnpm tauri:sidecar` locates it
  with `which uv` on POSIX or `where uv` on Windows.

Useful sanity checks:

```bash
node --version
pnpm --version
uv --version
rustc --version
cargo --version
pnpm --dir nextjs-frontend exec tauri --version
```

Windows PowerShell:

```powershell
node --version
pnpm --version
uv --version
rustc --version
cargo --version
pnpm --dir nextjs-frontend exec tauri --version
rustup default stable-msvc
rustc --print host-tuple
```

For 64-bit Windows, `rustc --print host-tuple` should usually report
`x86_64-pc-windows-msvc`.

## Sidecar Build

Build or refresh the FastAPI sidecar from `nextjs-frontend`:

```bash
cd nextjs-frontend
pnpm tauri:sidecar
```

Expected macOS arm64 outputs:

```text
src-tauri/binaries/pmt-backend-aarch64-apple-darwin
src-tauri/target/debug/pmt-backend
```

Expected 64-bit Windows outputs when run on Windows:

```text
src-tauri/binaries/pmt-backend-x86_64-pc-windows-msvc.exe
src-tauri/target/debug/pmt-backend.exe
```

If the script reuses an old sidecar when backend code changed, force a
rebuild:

```bash
PMT_FORCE_REBUILD_SIDECAR=1 pnpm tauri:sidecar
```

Windows PowerShell:

```powershell
$env:PMT_FORCE_REBUILD_SIDECAR = "1"
pnpm tauri:sidecar
Remove-Item Env:\PMT_FORCE_REBUILD_SIDECAR
```

The PyInstaller build can print optional warnings for packages that are
not used on the current platform. A successful run exits 0 and writes
the sidecar binary above.

## Static Export

Verify the desktop static export directly:

```bash
cd nextjs-frontend
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Windows PowerShell:

```powershell
cd nextjs-frontend
$env:TAURI_BUILD = "1"
$env:NEXT_PUBLIC_DESKTOP_TARGET = "1"
$env:NEXT_PUBLIC_DESKTOP_API_BASE_URL = "http://127.0.0.1:18475"
pnpm build
```

Expected output is `nextjs-frontend/out/`. The current route count is
59 static pages.

## Development Launch

Run the desktop shell:

```bash
cd nextjs-frontend
pnpm tauri:dev
```

This starts Next.js through `pnpm dev:tauri`, launches the Rust Tauri
shell, and starts the sidecar. Do not start a separate FastAPI server
for desktop testing unless you are intentionally debugging a separate
backend.

Health checks after the window opens:

```bash
curl -sS http://127.0.0.1:18475/api/health
curl -sS -o /tmp/pmt-positions.json -w 'HTTP:%{http_code} SIZE:%{size_download}\n' \
  http://127.0.0.1:18475/api/positions/
```

Windows PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:18475/api/health
(Invoke-WebRequest http://127.0.0.1:18475/api/positions/).StatusCode
```

Expected health response:

```json
{"status":"ok","runtime":"desktop","database_backend":"sqlite"}
```

## Production Bundle

Build a distributable bundle:

```bash
cd nextjs-frontend
pnpm tauri:sidecar
pnpm tauri:build
```

macOS outputs:

```text
src-tauri/target/release/bundle/macos/Portfolio Management Tool.app
src-tauri/target/release/bundle/dmg/Portfolio Management Tool_0.0.8_aarch64.dmg
```

Windows builds should be produced on a Windows machine or Windows CI
runner with the MSVC toolchain. Tauri writes bundle artifacts under
`src-tauri/target/release/bundle/`, with Windows installer subfolders
such as `nsis/` or `msi/` depending on the configured targets and
installed bundler tools.

After launching a release app, verify the same sidecar health endpoint:

```bash
curl -sS http://127.0.0.1:18475/api/health
```

## Windows Notes

For Windows, prefer a native Windows build or Windows CI job. The
project scripts are Windows-aware: `build-sidecar.mjs` uses `where uv`,
uses the Windows PyInstaller data separator, adds `.exe`, and writes a
target-triple sidecar name that matches Tauri `externalBin`.

Cross-checking `x86_64-pc-windows-msvc` from macOS can fail before it
reaches project code if the Windows/MSVC C toolchain and headers are
not installed. A native Windows verification should run:

```powershell
cd nextjs-frontend
pnpm tauri:sidecar
pnpm tauri:dev
Invoke-RestMethod http://127.0.0.1:18475/api/health
pnpm tauri:build
```

## References

- Tauri prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri Windows installer guide:
  https://v2.tauri.app/distribute/windows-installer/
