# Get Started

This guide is for the current Portfolio Management Tool rebuild on
`feat/nextjs-fastapi-rebuild`: Next.js 16 frontend, FastAPI backend,
Tauri desktop shell, and the Reflex reference app used for parity
checks.

## Prerequisites

- Node.js 20+ and `pnpm`
- Python 3.12 and `uv`
- Rust toolchain (`rustup`, `cargo`) for Tauri desktop work
- Optional: Docker if you need the PostgreSQL/MailHog compose stack
- Reflex reference checkout:
  `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`

Install dependencies:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool

cd fastapi_backend
uv sync --all-groups

cd ../nextjs-frontend
pnpm install
```

## Environment Files

Committed examples must keep auth bypass OFF:

- `fastapi_backend/.env.example` documents
  `# PMT_AUTH_DISABLED=true` as a commented local-only override.
- `nextjs-frontend/.env.example` sets
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

For parity work, prefer one-command environment overrides instead of
editing `.env` files.

## Three-Service Parity Loop

Use three terminals. The backend command uses a repo-local SQLite file,
which avoids requiring PostgreSQL for parity checks.

Terminal A, FastAPI backend on `127.0.0.1:8000`:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B, Next.js web app on `localhost:3000`:

```bash
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev
```

Terminal C, Reflex reference on `localhost:3001/pmt/`:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
```

Health checks before browser work:

```bash
curl -sS http://127.0.0.1:8000/api/health
curl -sSI http://127.0.0.1:3000 | sed -n '1,8p'
curl -sSI http://127.0.0.1:3001/pmt/ | sed -n '1,8p'
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

Static export verification:

```bash
cd nextjs-frontend
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Desktop commands:

```bash
cd nextjs-frontend
pnpm tauri:sidecar
pnpm tauri:dev
pnpm tauri:build
```

The sidecar default API URL is `http://127.0.0.1:18475`. Override it
only when testing desktop startup or packaging behavior.

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

Last known gate-close results:

| Check | Result |
|---|---|
| TypeScript | clean |
| Jest | 28 suites / 157 tests passed in 1.857 s |
| Lint | 0 errors / 0 warnings |
| Web build | 59 / 59 static pages generated |
| Backend pytest | 187 passed, 2 skipped in 9.42 s |
| Desktop static export | 59 / 59 static pages generated |

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
- If dashboard pages redirect to login during parity work, confirm both
  `PMT_AUTH_DISABLED=true` and `NEXT_PUBLIC_AUTH_DISABLED=1` are set
  in the shell commands that started the backend and frontend.
- If Next.js screenshots show the notification sidebar collapsed, use a
  fresh browser session or clear the `pmt:next:notificationSidebarOpen`
  key.
- If a Tauri build reuses an old sidecar, run `PMT_FORCE_REBUILD_SIDECAR=1 pnpm tauri:sidecar`.
- If AG Grid reports a missing Enterprise license in development, that
  is expected until license procurement is reprioritized.
