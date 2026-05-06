# Current Parity Rebuild Compact Plan - 2026-05-11

This compact plan supersedes the long 2026-05-05 through 2026-05-11
handoff chain for day-to-day continuation. Keep the older handoff
prompts as historical evidence, but start new agent work here.

## Current Branch State

- Repo: `/Users/orbot/Developer/work/Portfolio-Management-Tool`
- Branch: `feat/nextjs-fastapi-rebuild`
- Gate-close implementation HEAD: `82142c9` (later docs-only prompt
  commits may exist)
- Reflex reference: `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`
- Reflex base URL: `http://localhost:3001/pmt/`
- Next.js base URL: `http://localhost:3000/dashboard/`
- FastAPI base URL: `http://127.0.0.1:8000`

`git status --short --branch` must be clean before handoff.

## What Is Done

The Next.js 16 + FastAPI + Tauri rebuild has closed the major
parity passes from the original Reflex app:

- Phase 1 per-route walk completed across 50 routes.
- Milestone A backend/filter-bar work completed.
- Milestone B client-side simulators completed across live grids,
  including Events.
- Milestone C gates closed:
  - F-7 Reset Dates `market_price` is hidden from default visible
    columns and the Reflex multi-field filter is wired through FastAPI
    plus the generated OpenAPI client.
  - F-21 notification sidebar defaults open and persists explicit user
    toggles under `pmt:next:notificationSidebarOpen`.
  - F-23 notification sidebar lazy-renders 20 cards at a time.
  - F-35 Next.js read-only column supersets are documented as
    intentional enhancements over older Reflex hide lists.
  - F-36 Portfolio Tools labels use the longer Reflex wording.
- 22 canonical parity screenshots were re-shot at 1440x900 after the
  gate close.

## Final Verification From Gate Close

Run from `nextjs-frontend` unless noted:

| Check | Last Result |
|---|---|
| `pnpm exec tsc --noEmit --pretty false` | clean |
| `pnpm exec jest --runInBand` | 28 suites / 157 tests passed in 1.857 s |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` | 59 / 59 static pages generated |
| Tauri/desktop static export | 59 / 59 static pages generated |
| Backend pytest with sqlite override | 187 passed, 2 skipped in 9.42 s |

Desktop static export command:

```bash
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Backend pytest command:

```bash
cd fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

## Three-Service Parity Loop

Terminal A, backend:

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

Health checks before browser work:

```bash
curl -sS http://127.0.0.1:8000/api/health
curl -sSI http://127.0.0.1:3000 | sed -n '1,8p'
curl -sSI http://127.0.0.1:3001/pmt/ | sed -n '1,8p'
```

## Canonical Screenshot Set

The canonical set is 22 PNGs under `docs/parity-screenshots/`: one
Reflex and one Next.js screenshot for each canonical module landing
page.

Routes:

- `market-data/market-data`
- `positions/positions`
- `pnl/pnl-change`
- `risk/delta-change`
- `recon/pps-recon`
- `compliance/restricted-list`
- `portfolio-tools/pay-to-hold`
- `instruments/ticker-data`
- `events/event-calendar`
- Reflex `operations/daily-procedure-check` / Next
  `operations/daily-procedures`
- `orders/emsx-order`

Use fresh in-memory Playwright sessions at 1440x900 when re-shooting.
For Next.js captures, use a new browser session so no old
`pmt:next:notificationSidebarOpen=false` preference collapses the
sidebar.

## Hard Rules For Future Work

- Reflex at `:3001/pmt/` remains the visual and behavioral spec unless
  a documented intentional delta says otherwise.
- Do not hand-edit `nextjs-frontend/app/openapi-client/`; regenerate
  with `pnpm generate-client` against a running backend.
- Authentication is disabled by default for local parity. Set
  `PMT_AUTH_DISABLED=false` and `NEXT_PUBLIC_AUTH_DISABLED=0` for
  authenticated JWT checks.
- Storage keys stay under the `pmt:next:` namespace.
- One commit per defect or coherent documentation artifact.
- Push every 2-3 commits during long work.
- Cite exact test counts and times; do not write only "green".
- Do not implement out-of-scope items unless explicitly reprioritized:
  F-9 Plotly 3-D pricer chart, F-27 mobile responsive nav,
  F-28 Reflex ticker-data divergence, AG Grid Enterprise license
  procurement.

## Recommended Next Workstreams

1. Documentation/setup/AGENTS refresh.
   Use
   `docs/plans/codex-team-prompt-docs-setup-agents-2026-05-11.md`.
2. Independent review, test, and parity re-audit.
   Use
   `docs/plans/codex-team-prompt-review-test-parity-2026-05-11.md`.
