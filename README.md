# Portfolio Management Tool

Portfolio Management Tool is a parity rebuild of the Reflex PMT app on
**Next.js 16**, **FastAPI**, and **Tauri v2**. Shared business logic and
mock data live in `pmt_core_pkg/pmt_core`; the Next.js frontend and
FastAPI backend consume that package directly.

## Project Layout

```text
Portfolio-Management-Tool/
├── nextjs-frontend/          # Next.js 16, React 19, AG Grid, Tauri shell
│   ├── app/                  # App Router pages and generated OpenAPI client
│   ├── components/           # Dashboard chrome, grids, forms, UI primitives
│   ├── lib/                  # Runtime config, auth, routes, grid registry
│   └── src-tauri/            # Tauri v2 app, sidecar scripts, Rust shell
├── fastapi_backend/          # FastAPI app, auth, OpenAPI, sidecar entrypoint
│   ├── app/                  # Config, routes, schemas, database setup
│   └── commands/             # OpenAPI export and Tauri sidecar runner
├── pmt_core_pkg/             # Framework-agnostic PMT services/repositories
├── docs/                     # Setup, parity, audit, and planning docs
└── continuations.md          # Current continuation log and verification notes
```

## Current Parity Status

Start new parity work from
`docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md`, not from
the older handoff prompts.

- Branch: `feat/nextjs-fastapi-rebuild`
- Gate-close implementation HEAD: `82142c9` (later docs-only commits
  may exist)
- Milestone B and Milestone C are closed through that implementation
  head.
- F-7, F-21, F-23, F-35, and F-36 are closed.
- F-9, F-27, F-28, and AG Grid Enterprise license procurement are
  intentional out-of-scope deltas unless reprioritized.
- Next.js read-only column supersets are intentional where documented.

## Prerequisites

- Node.js 20+ and `pnpm`
- Python 3.12 and `uv`
- Rust toolchain (`rustup`, `cargo`) for Tauri work
- Tauri platform prerequisites for desktop work:
  Xcode Command Line Tools on macOS; Microsoft C++ Build Tools,
  WebView2, and the Rust MSVC toolchain on Windows
- The Reflex reference checkout at
  `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex` for
  parity checks

The default local path below uses SQLite and does not require
PostgreSQL.

Install dependencies once:

```bash
cd fastapi_backend
uv sync --all-groups

cd ../nextjs-frontend
pnpm install
```

## Local Parity Run

Use three terminals. Authentication is disabled by default for the
current local web and desktop workflow. Set `PMT_AUTH_DISABLED=false`
and `NEXT_PUBLIC_AUTH_DISABLED=0` when you need to exercise the
authenticated JWT flow.

Terminal A, FastAPI with a local SQLite dev DB:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B, Next.js:

```bash
cd nextjs-frontend
pnpm dev
```

Terminal C, Reflex reference:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
```

Windows PowerShell equivalents:

```powershell
cd fastapi_backend
$backendPath = (Get-Location).Path -replace '\\', '/'
$env:DATABASE_URL = "sqlite+aiosqlite:///$backendPath/.pmt-dev.sqlite3"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```powershell
cd nextjs-frontend
pnpm dev
```

```powershell
cd C:\path\to\Portfolio-Management-Tool-reflex
uv run reflex run
```

Expected URLs:

| Service | URL |
|---|---|
| FastAPI | `http://127.0.0.1:8000` |
| FastAPI docs | `http://127.0.0.1:8000/docs` |
| Next.js dashboard | `http://localhost:3000/dashboard/` |
| Reflex reference | `http://localhost:3001/pmt/` |

Health checks:

```bash
curl -sS http://127.0.0.1:8000/api/health
curl -sSI http://127.0.0.1:3000
curl -sSI http://127.0.0.1:3001/pmt/
```

Windows PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
(Invoke-WebRequest http://127.0.0.1:3000 -Method Head).StatusCode
(Invoke-WebRequest http://127.0.0.1:3001/pmt/ -Method Head).StatusCode
```

## OpenAPI Client

Regenerate the frontend client whenever FastAPI route signatures,
response models, auth behavior, or generated schemas change. Start the
backend first, then run:

```bash
cd nextjs-frontend
pnpm generate-client
```

Do not hand-edit `nextjs-frontend/app/openapi-client/`; it is generated
from the live backend schema.

## Desktop / Tauri Setup

Tauri packages the Next.js static export in `nextjs-frontend/out` and a
PyInstaller FastAPI sidecar binary from
`nextjs-frontend/src-tauri/binaries/`. The sidecar starts inside the
desktop app, listens on `127.0.0.1:18475`, and uses a local app-data
SQLite database. Full setup details are in
[docs/tauri-desktop.md](docs/tauri-desktop.md).

One-time sanity checks:

```bash
node --version
pnpm --version
uv --version
rustc --version
cargo --version
pnpm --dir nextjs-frontend exec tauri --version
```

Build or refresh the sidecar:

```bash
cd nextjs-frontend
pnpm tauri:sidecar
```

Expected macOS arm64 outputs:

```text
src-tauri/binaries/pmt-backend-aarch64-apple-darwin
src-tauri/target/debug/pmt-backend
```

On 64-bit Windows, run the same command from PowerShell after installing
the MSVC toolchain. Expected outputs:

```text
src-tauri/binaries/pmt-backend-x86_64-pc-windows-msvc.exe
src-tauri/target/debug/pmt-backend.exe
```

Desktop static export verification:

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

Run the desktop app in development:

```bash
cd nextjs-frontend
pnpm tauri:dev
```

Health checks while the desktop app is running:

```bash
curl -sS http://127.0.0.1:18475/api/health
curl -sS -o /tmp/pmt-positions.json -w 'HTTP:%{http_code} SIZE:%{size_download}\n' \
  http://127.0.0.1:18475/api/positions/
```

Build the production bundle:

```bash
cd nextjs-frontend
pnpm tauri:sidecar
pnpm tauri:build
```

macOS artifacts are written under:

```text
src-tauri/target/release/bundle/macos/
src-tauri/target/release/bundle/dmg/
```

Windows builds should be produced on a Windows machine or Windows CI
runner with Microsoft C++ Build Tools, WebView2, Rust stable MSVC,
Python/uv, Node, and pnpm. Tauri writes Windows artifacts under
`src-tauri/target/release/bundle/` subfolders such as `nsis/` or
`msi/`, depending on the installed bundler tools.

## Verification

Frontend:

```bash
cd nextjs-frontend
pnpm exec tsc --noEmit --pretty false
pnpm exec jest --runInBand
pnpm lint
pnpm build
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Backend:

```bash
cd fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

Windows PowerShell:

```powershell
cd fastapi_backend
$backendPath = (Get-Location).Path -replace '\\', '/'
$env:TEST_DATABASE_URL = "sqlite+aiosqlite:///$backendPath/.pytest-sqlite.sqlite3"
.\.venv\Scripts\python.exe -m pytest -q
```

Last known verification on 2026-05-06:

- TSC clean.
- Jest: 31 suites / 163 tests passed in 2 s.
- Lint: 0 errors / 0 warnings.
- Web build: 59 / 59 static pages generated.
- Backend pytest: 187 passed, 2 skipped in 8.53 s.
- Desktop static export: 59 / 59 static pages generated.
- `pnpm tauri:sidecar`, `pnpm tauri:dev`, and `pnpm tauri:build`
  passed on macOS arm64.

## Parity Artifacts

Canonical screenshots and capture instructions live in
`docs/parity-screenshots/README.md`. Use fresh browser sessions at
1440x900, capture Reflex and Next.js together, and keep motion evidence
as `.webm` when still frames cannot prove the behavior.
