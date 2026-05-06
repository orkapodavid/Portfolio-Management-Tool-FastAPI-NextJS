# Codex Team Prompt - Review, Test, And Feature Parity Re-Audit

You are a Codex agent team assigned to perform an independent review,
test pass, and another round of feature parity comparison for the
Portfolio Management Tool rebuild.

Treat this as a verification and bug-finding mission. Do not assume the
previous session was perfect. Confirm by running the software, reading
the code, and comparing against Reflex.

## Repo And Branch

```text
Repo: /Users/orbot/Developer/work/Portfolio-Management-Tool
Branch: feat/nextjs-fastapi-rebuild
Expected minimum starting HEAD: 82142c9 or newer
Reflex spec: /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
```

Start with:

```bash
git status --short --branch
git log --oneline -20
```

Read:

```text
docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md
continuations.md
docs/parity-audit/2026-05-09/findings.md
docs/parity-audit/2026-05-09/route-matrix.md
docs/parity-screenshots/README.md
```

## Scope

Verify the current rebuilt app after the Milestone C gate close:

- F-7 Reset Dates `market_price` hidden and multi-field filter wired.
- F-21 notification sidebar default-open with stored preference.
- F-23 notification lazy rendering / infinite-scroll behavior.
- F-35 Next.js read-only column supersets documented as intentional.
- F-36 Portfolio Tools labels normalized.
- Existing grid runtime features: Excel export, layout persistence,
  compact mode, row numbers, multi-select, range selection, status bar,
  auto-refresh where appropriate, live cell flash, notification jump.
- Backend route/query behavior and generated OpenAPI client alignment.
- Tauri/desktop static export still builds.

Out of scope unless explicitly reprioritized:

- F-9 Plotly 3-D pricer chart.
- F-27 mobile responsive nav.
- F-28 Reflex ticker-data divergence.
- AG Grid Enterprise license procurement.

## Service Setup

Terminal A, backend:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B, Next.js:

```bash
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev
```

Terminal C, Reflex:

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

## Required Verification Matrix

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

Record exact counts and elapsed times. Do not summarize as only
"green".

## Browser Parity Work

Use `playwright-cli` with two named sessions at 1440x900:

```bash
playwright-cli -s=reflex-review open --browser=chrome
playwright-cli -s=reflex-review resize 1440 900
playwright-cli -s=nextjs-review open --browser=chrome
playwright-cli -s=nextjs-review resize 1440 900
```

Run a full-route walk against `docs/parity-audit/2026-05-09/route-matrix.md`.
For each route, compare:

- navigation chrome,
- subtab labels,
- page-specific filter bars,
- toolbar controls,
- grid columns and known intentional supersets,
- floating filters,
- row counts and mock data shape,
- row grouping where expected,
- auto-refresh visibility,
- cell flash on live pages,
- notification sidebar and jump behavior.

Re-shoot the 22 canonical screenshots only after the review pass is
complete or after any visual fix.

Canonical screenshot routes:

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

Use fresh Next.js sessions so localStorage does not hide the default
open notification sidebar.

## Focused Manual Checks

Reset Dates:

- Visit `/dashboard/portfolio-tools/reset-dates`.
- Confirm the filter bar has ticker, start/end date, frequency, reset
  month, reset day, and up/down controls.
- Confirm `Market Price` is absent from visible grid headers.
- Change filters and confirm the API request includes query params.

Notifications:

- With a fresh browser session, confirm sidebar opens on first paint.
- Collapse it, reload, and confirm the stored preference keeps it
  collapsed.
- Seed or mock enough notifications to confirm only 20 render
  initially and more appear on scroll/click fallback.
- Test same-page and cross-page notification jump-to-row.

Column supersets:

- Confirm documented supersets are read-only visibility additions, not
  data shape regressions.
- If a column appears to conflict with Reflex rather than enhance it,
  file a specific finding with route, column, screenshot, and proposed
  decision.

## Review Expectations

Run a code-review pass focused on:

- stale generated OpenAPI types versus FastAPI route signatures,
- auth-bypass safety,
- storage keys outside `pmt:next:`,
- layout persistence regressions,
- random/flaky simulator tests,
- screenshot drift,
- Tauri build regressions,
- docs that contradict current behavior.

If you find defects:

- one commit per defect,
- include focused tests where feasible,
- regenerate OpenAPI client only through `pnpm generate-client`,
- push every 2-3 commits,
- update `continuations.md` with exact verification.

If you find no defects:

- update `continuations.md` with the review scope, exact verification
  counts, screenshot status, and residual risks.
- keep the branch clean and pushed.

## Deliverables

- A concise review report in `continuations.md`.
- Any defect fixes as separate commits.
- Updated screenshots if the visual baseline changed.
- Exact verification counts and timings.
- Final `git status --short --branch` clean and pushed.
