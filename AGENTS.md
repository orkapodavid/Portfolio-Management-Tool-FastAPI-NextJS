# Repository Rules

## Project Layout

- `nextjs-frontend/` - Next.js 16 web app, AG Grid dashboard, generated
  OpenAPI client, and Tauri desktop shell.
- `fastapi_backend/` - FastAPI API, auth, OpenAPI schema, and desktop
  sidecar launcher.
- `pmt_core_pkg/` - shared PMT domain services, repositories, and mock
  data.
- `docs/` - setup docs, parity evidence, audits, and historical plans.
- `docs/parity-screenshots/` - canonical parity PNGs and motion
  artifacts.
- `nextjs-frontend/app/openapi-client/` - generated only; do not edit
  by hand.

## Build and Test

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

## Parity Workflow

- Treat Reflex at `http://localhost:3001/pmt/` as the visual and
  behavioral spec unless `docs/parity-screenshots/README.md` documents
  an intentional delta.
- Start parity work from
  `docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md`.
- Milestone B and C are closed through implementation HEAD `82142c9`;
  later docs-only commits may exist.
- F-7, F-21, F-23, F-35, and F-36 are closed.
- F-9, F-27, F-28, and AG Grid Enterprise license procurement are
  intentional out-of-scope deltas unless reprioritized.
- Next.js read-only column supersets are intentional where documented.

Three-service parity loop:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```bash
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev
```

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
```

Health checks:

```bash
curl -sS http://127.0.0.1:8000/api/health
curl -sSI http://127.0.0.1:3000 | sed -n '1,8p'
curl -sSI http://127.0.0.1:3001/pmt/ | sed -n '1,8p'
```

For Windows PowerShell and non-Docker human setup commands, keep
`docs/get-started.md` in sync with the POSIX examples above.

## OpenAPI Regeneration

- Never hand-edit `nextjs-frontend/app/openapi-client/`.
- Regenerate from a running backend after FastAPI route, schema, or
  auth contract changes:

```bash
cd nextjs-frontend
pnpm generate-client
```

## Safety Rules

- Auth-bypass flags are local parity-only:
  `PMT_AUTH_DISABLED=true` and `NEXT_PUBLIC_AUTH_DISABLED=1`.
- Keep auth-bypass flags OFF in committed env examples.
- Never enable auth bypass in production or shared long-lived
  environments.
- All browser storage keys must use the `pmt:next:` prefix, including
  notification, pending-highlight, and grid-layout keys.

## Screenshot and Artifact Rules

- Canonical parity evidence is 22 PNGs: one Reflex and one Next.js
  capture for each canonical module landing page.
- Save stills as
  `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`.
- Use fresh 1440x900 browser sessions.
- Use `.webm` only for behaviors still frames cannot prove, such as
  live flash cadence or notification jump.
- Update `docs/parity-screenshots/README.md` when canonical artifacts
  or intentional deltas change.

## Commit Discipline

- One commit per defect or one coherent documentation artifact.
- Do not bundle unrelated fixes.
- Keep generated OpenAPI changes with the API/client change that
  required them.
- Push every 2-3 commits during long work.
- Cite exact test counts and timings in `continuations.md`; do not
  write only "green".
