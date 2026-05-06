# Additional Settings

This page collects secondary local-development commands. The main setup
flow is in [Get Started](get-started.md).

## OpenAPI Client

Regenerate the frontend client from a running FastAPI backend:

```bash
cd nextjs-frontend
pnpm generate-client
```

The script fetches `/openapi.json` from the backend, writes
`nextjs-frontend/openapi.json`, and regenerates
`nextjs-frontend/app/openapi-client/`.

If you only need to export the backend schema file manually:

```bash
cd fastapi_backend
uv run python -m commands.generate_openapi_schema
```

## Auth Bypass

Local parity work bypasses login by default. Use explicit false values
when you need to exercise authenticated JWT flows:

```bash
PMT_AUTH_DISABLED=false
NEXT_PUBLIC_AUTH_DISABLED=0
```

## Tests

Frontend:

```bash
cd nextjs-frontend
pnpm exec tsc --noEmit --pretty false
pnpm exec jest --runInBand
pnpm lint
pnpm build
```

Windows PowerShell uses the same frontend commands.

Backend with SQLite test DB:

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

Desktop static export:

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

For the full desktop workflow, including sidecar build, dev launch,
bundle output, health checks, and Windows prerequisites, see
[Tauri Desktop Setup](tauri-desktop.md).

## Docker Services

Docker is optional. It remains useful for PostgreSQL and MailHog when a
task needs the compose stack:

```bash
docker compose up db -d
make docker-up-mailhog
```

MailHog is available at `http://localhost:8025`.

## Migrations

For PostgreSQL-backed work:

```bash
cd fastapi_backend
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

## Pre-Commit

Install hooks if you are using the local pre-commit workflow:

```bash
pre-commit install -c .pre-commit-config.yaml
pre-commit run --all-files -c .pre-commit-config.yaml
```
