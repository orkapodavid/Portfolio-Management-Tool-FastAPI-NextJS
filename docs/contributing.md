# Contributing

Contributions on `feat/nextjs-fastapi-rebuild` should preserve parity
with the Reflex reference unless a documented intentional delta says
otherwise.

## Before You Start

1. Read `docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md`.
2. Check `continuations.md` for the latest landed commits and exact
   verification results.
3. Review `docs/parity-screenshots/README.md` before visual or grid
   changes.
4. Run `git status --short --branch` and keep unrelated local changes
   out of your commits.

## Local Setup

Use [Get Started](get-started.md) for dependency installation and the
three-service parity loop:

- FastAPI on `127.0.0.1:8000`
- Next.js on `localhost:3000`
- Reflex reference on `localhost:3001/pmt/`

The local parity commands use the default no-auth mode. Set
`PMT_AUTH_DISABLED=false` and `NEXT_PUBLIC_AUTH_DISABLED=0` only when a
task needs to exercise authenticated JWT flows.

## OpenAPI Changes

Regenerate the frontend client whenever FastAPI route signatures,
response models, auth behavior, or generated schema output changes:

```bash
cd nextjs-frontend
pnpm generate-client
```

Do not hand-edit `nextjs-frontend/app/openapi-client/`.

## Tests and Builds

Run the checks that match your change. For shared behavior, API shape,
grid runtime, or parity-visible work, run the full relevant set.

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

Record exact suite counts, route counts, and timings in
`continuations.md`; do not write only "green".

## Parity Evidence

For visual or interaction changes:

- Compare against Reflex at `http://localhost:3001/pmt/`.
- Capture fresh 1440x900 browser sessions.
- Store canonical stills under
  `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`.
- Use `.webm` for behaviors still frames cannot prove.
- Update `docs/parity-screenshots/README.md` when canonical artifacts
  or intentional deltas change.

## Commit Discipline

- Use one commit per defect or one coherent documentation artifact.
- Do not bundle unrelated fixes.
- Keep generated OpenAPI changes in the same commit as the API/client
  change that requires them.
- Push every 2-3 commits during long work.
