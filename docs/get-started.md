# Get Started

This guide is for the current Portfolio Management Tool rebuild on
`feat/nextjs-fastapi-rebuild`: Next.js 16 frontend, FastAPI backend,
Tauri desktop shell, and the Reflex reference app used for parity
checks.

## Prerequisites

- Node.js 20+ and `pnpm`
- Python 3.12 and `uv`
- Rust toolchain (`rustup`, `cargo`) for Tauri desktop work
- Tauri platform prerequisites for desktop work:
  Xcode Command Line Tools on macOS; Microsoft C++ Build Tools,
  WebView2, and the Rust MSVC toolchain on Windows
- Reflex reference checkout:
  `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`

The local setup path uses SQLite: FastAPI runs against a local SQLite
file, Next.js runs with `pnpm dev`, and Reflex runs from the sibling
reference checkout. PostgreSQL is supported by setting `DATABASE_URL`
yourself, but is not required for parity work.

Install dependencies:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool

cd fastapi_backend
uv sync --all-groups

cd ../nextjs-frontend
pnpm install
```

On Windows, run the same dependency commands from PowerShell. Python
executables inside the backend venv live under `.\.venv\Scripts\`.

## Environment Files

Authentication is disabled by default for the current local web and
desktop workflow:

- `fastapi_backend/.env.example` sets `PMT_AUTH_DISABLED=true`.
- `nextjs-frontend/.env.example` sets `NEXT_PUBLIC_AUTH_DISABLED=1`.

For authenticated local development, set `PMT_AUTH_DISABLED=false` and
`NEXT_PUBLIC_AUTH_DISABLED=0`.

For normal authenticated local development, copy the examples and fill
secret keys:

```bash
cd fastapi_backend
cp .env.example .env
python3 -c "import secrets; print(secrets.token_hex(32))"

cd ../nextjs-frontend
cp .env.example .env.local
```

For parity work, the defaults are enough; no auth-bypass shell
overrides are needed.

## Three-Service Parity Loop

Use three terminals. The backend command uses a repo-local SQLite file,
which avoids requiring PostgreSQL for parity checks.

Terminal A, FastAPI backend on `127.0.0.1:8000`:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B, Next.js web app on `localhost:3000`:

```bash
cd nextjs-frontend
pnpm dev
```

Terminal C, Reflex reference on `localhost:3001/pmt/`:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
```

### Windows PowerShell Parity Loop

Terminal A:

```powershell
cd fastapi_backend
$backendPath = (Get-Location).Path -replace '\\', '/'
$env:DATABASE_URL = "sqlite+aiosqlite:///$backendPath/.pmt-dev.sqlite3"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B:

```powershell
cd nextjs-frontend
pnpm dev
```

Terminal C:

```powershell
cd C:\path\to\Portfolio-Management-Tool-reflex
uv run reflex run
```

The SQLite URL uses forward slashes. The PowerShell examples normalize
`C:\...` paths to `C:/...` before building the SQLAlchemy URL.

Health checks before browser work:

```bash
curl -sS http://127.0.0.1:8000/api/health
curl -sSI http://127.0.0.1:3000 | sed -n '1,8p'
curl -sSI http://127.0.0.1:3001/pmt/ | sed -n '1,8p'
```

Windows PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
(Invoke-WebRequest http://127.0.0.1:3000 -Method Head).StatusCode
(Invoke-WebRequest http://127.0.0.1:3001/pmt/ -Method Head).StatusCode
```

Expected entry points:

| Service | URL |
|---|---|
| Next.js dashboard | `http://localhost:3000/dashboard/` |
| Reflex reference | `http://localhost:3001/pmt/` |
| FastAPI | `http://127.0.0.1:8000` |
| FastAPI docs | `http://127.0.0.1:8000/docs` |

## OpenAPI Client Regeneration

When FastAPI routes, response models, auth behavior, or schema output
change, start the backend and regenerate the frontend client:

```bash
cd nextjs-frontend
pnpm generate-client
```

This fetches the live backend schema from `/openapi.json`, writes
`nextjs-frontend/openapi.json`, and regenerates
`nextjs-frontend/app/openapi-client/`. Do not edit generated client
files by hand.

## Desktop / Tauri

The desktop shell packages a static Next.js export plus a FastAPI
sidecar. Tauri reads the frontend from `nextjs-frontend/out` and the
sidecar binary from `nextjs-frontend/src-tauri/binaries/`.

See [Tauri Desktop Setup](tauri-desktop.md) for the full desktop setup
guide, including Windows prerequisites and artifact paths.

Desktop sanity checks:

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

Expected current-platform outputs:

```text
src-tauri/binaries/pmt-backend-<target-triple>[.exe]
src-tauri/target/debug/pmt-backend[.exe]
```

Static export verification:

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

Desktop commands:

```bash
cd nextjs-frontend
pnpm tauri:dev
pnpm tauri:build
```

The sidecar default API URL is `http://127.0.0.1:18475`. Override it
only when testing desktop startup or packaging behavior.

Health checks while `pnpm tauri:dev` or a release app is running:

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

## Verification Commands

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

Last known gate-close results:

| Check | Result |
|---|---|
| TypeScript | clean |
| Jest | 31 suites / 163 tests passed in 2 s |
| Lint | 0 errors / 0 warnings |
| Web build | 59 / 59 static pages generated |
| Backend pytest | 187 passed, 2 skipped in 8.53 s |
| Desktop static export | 59 / 59 static pages generated |
| Tauri sidecar/dev/build | Passed on macOS arm64 |

## Parity Screenshots

Canonical evidence lives under `docs/parity-screenshots/`: one Reflex
and one Next.js PNG for each canonical module landing page. Capture
fresh browser sessions at 1440x900 and use `.webm` for behavior that
still screenshots cannot prove, such as live flash or notification
jump.

See `docs/parity-screenshots/README.md` for the current canonical
route list, expected deltas, and reproduction steps.

## Troubleshooting

- If `pnpm generate-client` fails, confirm the backend is running and
  `http://127.0.0.1:8000/openapi.json` responds.
- On Windows, use PowerShell `$env:NAME = "value"` assignments instead
  of POSIX inline `NAME=value command` syntax.
- If dashboard pages redirect to login during parity work, confirm
  `PMT_AUTH_DISABLED` is not set to `false` and
  `NEXT_PUBLIC_AUTH_DISABLED` is not set to `0`.
- If Next.js screenshots show the notification sidebar collapsed, use a
  fresh browser session or clear the `pmt:next:notificationSidebarOpen`
  key.
- If a Tauri build reuses an old sidecar, run `PMT_FORCE_REBUILD_SIDECAR=1 pnpm tauri:sidecar`.
- If AG Grid reports a missing Enterprise license in development, that
  is expected until license procurement is reprioritized.
