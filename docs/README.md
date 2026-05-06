# Portfolio Management Tool Docs

These docs cover the current Next.js 16 + FastAPI + Tauri parity
rebuild. The older prompt-style handoffs remain in `docs/plans/` as
history, but the compact plan is the day-to-day starting point.

## Start Here

- [Get Started](get-started.md) - local setup, ports, default no-auth
  parity loop, OpenAPI generation, desktop export, and verification.
- [Current parity rebuild plan](plans/current-parity-rebuild-compact-plan-2026-05-11.md)
  - current state after Milestone B/C closure.
- [Parity screenshots](parity-screenshots/README.md) - canonical
  screenshots, motion artifacts, and expected deltas.
- [Continuation log](../continuations.md) - latest landed commits and
  exact verification results.
- [Plans index](plans/PLANS_INDEX.md) - compact map of current and
  historical planning docs.

## Architecture Docs

- [Backend architecture](fastapi_backend/backend-architecture.md)
- [Backend development guide](fastapi_backend/backend-development-guide.md)
- [Backend API reference](fastapi_backend/backend-api-reference.md)
- [Next.js frontend walkthrough](nextjs-frontend/walkthrough.md)
- [Tauri desktop setup](tauri-desktop.md)
- [Tauri implementation plan](plans/tauri-implementation-plan.md)

## Current Status

- Implementation gate-close HEAD: `82142c9` on
  `feat/nextjs-fastapi-rebuild`; later docs-only commits may exist.
- Milestone B and Milestone C are closed through that implementation
  head.
- F-7, F-21, F-23, F-35, and F-36 are closed.
- F-9, F-27, F-28, and AG Grid Enterprise license procurement remain
  out-of-scope intentional deltas unless reprioritized.
- Next.js read-only column supersets are intentional where documented.

## Local Commands

The common local commands are summarized in [Get Started](get-started.md).
Use the SQLite dev DB path for parity work unless a task specifically
requires PostgreSQL:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```bash
cd nextjs-frontend
pnpm dev
```

Authentication is disabled by default for local web and desktop runs.
Set `PMT_AUTH_DISABLED=false` and `NEXT_PUBLIC_AUTH_DISABLED=0` when
you need to exercise authenticated JWT flows.
