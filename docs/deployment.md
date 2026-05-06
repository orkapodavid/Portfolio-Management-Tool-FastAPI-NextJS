# Deployment and Packaging

The active rebuild target is local web development plus Tauri desktop
packaging.

## Web Build

```bash
cd nextjs-frontend
pnpm build
```

The web build expects a reachable FastAPI API at the configured
`NEXT_PUBLIC_API_BASE_URL` for runtime calls.

## FastAPI Runtime

For local development and parity verification, run FastAPI with SQLite:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Windows PowerShell:

```powershell
cd fastapi_backend
$backendPath = (Get-Location).Path -replace '\\', '/'
$env:DATABASE_URL = "sqlite+aiosqlite:///$backendPath/.pmt-dev.sqlite3"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

For a PostgreSQL-backed environment, set `DATABASE_URL` and run Alembic
migrations before starting the API:

```bash
cd fastapi_backend
uv run alembic upgrade head
```

## Desktop Static Export

Tauri packages a static Next.js export from `nextjs-frontend/out` and a
FastAPI sidecar binary from `nextjs-frontend/src-tauri/binaries/`.
See [Tauri Desktop Setup](tauri-desktop.md) for the full setup and
troubleshooting guide.

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

## Tauri Bundle

```bash
cd nextjs-frontend
pnpm tauri:sidecar
pnpm tauri:build
```

The sidecar defaults to `http://127.0.0.1:18475` and stores desktop
data in the configured app-data directory.

macOS artifacts are written under:

```text
src-tauri/target/release/bundle/macos/
src-tauri/target/release/bundle/dmg/
```

Windows builds should be produced on a Windows machine or Windows CI
runner with Microsoft C++ Build Tools, WebView2, Rust stable MSVC,
Python/uv, Node, and pnpm. Tauri writes Windows artifacts under
`src-tauri/target/release/bundle/` subfolders such as `nsis/` or
`msi/`, depending on the configured targets and installed bundler tools.

## Release Notes

Before handing off a build, record the exact verification results in
`continuations.md`, including test counts, generated route counts, and
any skipped checks.
