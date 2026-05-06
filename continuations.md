# Portfolio Management Tool - Continuation Log

## Current Status (2026-05-11 — Milestone C gates closed)

### What landed

Closed the Milestone B loose end, then completed the independent
Milestone C items that did not require product decisions:

- `ff0a58a fix(grid): debounce search quick filter updates` added the
  300 ms quick-filter debounce and coverage.
- `67516da fix(grid-registry): retry pending highlights for 15 seconds`
  extended pending notification-highlight retry coverage.
- `3777571 fix(grid): hide auto refresh on calm pages` removed the
  Auto Refresh chrome from 13 non-live pages.
- `b9bdf03 feat(grid): enable row grouping on pnl and compliance grids`
  restored the Reflex row-group panel and grouping metadata on PnL and
  compliance grids.
- `113a4bc feat(events): add position-date filter on reverse-inquiry`
  added the missing Reverse Inquiry Position Date filter bar.
- `526dd6f style(chrome): align notification and toolbar polish with Reflex`
  tightened notification animation, subtab overflow, and toolbar date
  input polish.
- `d64ab03 feat(risk): add pricer pricing results and full notes`
  restored the pricer pricing-result tables and full note text, while
  leaving the out-of-scope Plotly 3-D chart untouched.
- `abe7fef feat(instruments): add stock-screener filter bar` added the
  Reflex-style Stock Screener filter bar and client-side filtering.
- `dd1c013 docs(parity-screenshots): re-capture 22 canonical screenshots after Milestone C`
  re-shot the 22 canonical Reflex/Next.js screenshot pairs at 1440x900.
- `45a31a0 feat(notifications): lazy-render sidebar alerts on scroll` closes
  F-23 by rendering sidebar notifications in 20-card batches with an
  IntersectionObserver sentinel and click fallback.
- `e614af9 fix(reset-dates): hide market price column for parity`
  removed the non-Reflex `market_price` column from the default Reset
  Dates grid while leaving the field available in row data.
- `94dd4a0 feat(reset-dates): add multi-field filter bar` added the
  Reflex ticker/date/frequency/month/day/up-down filter contract,
  backend query params, regenerated OpenAPI client, and focused
  frontend/backend tests.
- `f957ccc fix(notifications): default sidebar open with stored preference`
  matches Reflex's default-open sidebar while persisting user toggles
  under `pmt:next:notificationSidebarOpen`.
- `fddcc06 style(portfolio-tools): normalize column labels with Reflex`
  closed F-36 label abbreviation drift on Portfolio Tools pages.

Visual QA: a contact sheet of the 22 refreshed captures was inspected.
The captures are nonblank and framed correctly. Re-shoot after the
final verification pass captures the default-open notification sidebar
and Reset Dates filter bar.

### Product gates closed

- F-7: `market_price` is hidden from the default Reset Dates grid and
  the Reflex multi-field filter bar is wired end to end.
- F-21: notification sidebar now defaults open and stores explicit
  user toggles under `pmt:next:notificationSidebarOpen`.
- F-23: notification sidebar lazy-renders 20 cards at a time.
- F-35: Next.js read-only column supersets are documented as an
  intentional enhancement over older Reflex hide lists.
- F-36: Portfolio Tools labels now use the longer Reflex text.

Out-of-scope items stayed untouched: F-9 Plotly 3-D pricer chart,
F-27 mobile responsive nav, F-28 Reflex ticker-data divergence, and AG
Grid Enterprise license procurement.

### Verification

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | 26 suites / 153 tests passed in 1.653 s |
| `pnpm lint` | 0 errors / 0 warnings |
| Backend pytest with sqlite override | 186 passed, 2 skipped in 8.61 s |
| `pnpm build` | PASS — 59 / 59 static pages generated |
| Desktop static export (`TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 ... pnpm build`) | PASS — 59 / 59 static pages generated |

## Current Status (2026-05-11 — Milestone B simulator rollout closed)

### What landed

Closed the orphaned Milestone B events work that was left unstaged
after the B5 reset:

- `7b1d868 feat(events): add client-side simulators for live cell flash`
  added `eventCalendarSimulator`, `eventStreamSimulator`, and
  `reverseInquirySimulator`, plus tests and `simulateUpdate` wiring on
  the three events pages.
- `acc78af docs(plans): handoff brief for finishing Milestone B and running Milestone C`
  committed the 2026-05-11 handoff brief.
- `e598e95 docs(parity-screenshots): re-capture 22 canonical screenshots after Milestone B`
  re-shot all canonical module screenshot pairs at 1440x900 with
  backend, Next.js, and Reflex healthy under the auth-bypass parity
  setup.

Sanity check: `orders/emsx-order` already had
`simulateUpdate={emsxOrderSimulator}` wired on its `<DataGrid>`.

### Verification

| Check | Result |
|---|---|
| `pnpm --dir nextjs-frontend exec tsc --noEmit` | clean |
| `pnpm --dir nextjs-frontend exec jest --runInBand __tests__/eventsSimulators.test.ts` | 1 suite / 8 tests passed in 0.293 s |
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | 24 suites / 147 tests passed in 1.58 s |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` | PASS — 59 / 59 static pages generated |
| Backend pytest with sqlite override | 186 passed, 2 skipped in 8.53 s |

Branch was pushed through `acc78af` before the screenshot refresh;
push `e598e95` after this continuation entry lands.

## Current Status (2026-05-08 — Live flash + notification jump parity closed)

### What landed this session

5 commits on `feat/nextjs-fastapi-rebuild`, working from
`docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md`.

**Live-data feel (2 commits).**
- `bd3b5bc feat(grid): expose per-page autoRefreshIntervalMs and tune market-data to 2s`
  added explicit 2 s cadence coverage in the DataGrid polling test and
  temporarily tuned Market Data / FX pages for the live cadence.
- `284dde8 feat(grid): client-side row simulator drives cell flash between refreshes`
  added `lib/grid-simulators.ts` plus `simulateUpdate` /
  `simulateUpdateIntervalMs` DataGrid props. Market Data and FX now
  simulate 1-5 row updates every 2 s while backend refresh falls back
  to the wrapper's 30 s default. Playwright DOM sampling on
  `/dashboard/market-data/market-data` showed `last_price` values
  changing on alternating 2 s ticks with AG Grid flash classes present.

**Notification jump (3 commits).**
- `fa85db8 feat(notifications): cross-page jump-to-row via sessionStorage handoff`
  added `lib/notification-routes.ts`, slug resolution through
  `lib/constants.ts`, `pmt:next:pendingHighlight`, and mount-time
  pending-highlight pickup with short retry through async row loading.
- `b1172d9 fix(grid-registry): re-apply sticky notification highlight every 200ms during scroll`
  replaced the one-shot 0/100/350 ms highlight reapply with a tracked
  200 ms interval for 1.8 s and matched Reflex's sticky highlight CSS.
- `adaca02 fix(notifications): honor payload row id keys when jumping`
  fixed the manual-test gap where notifications target `ticker=AAPL`
  but some pages register DataGrid with the default `id` row key.
  `jumpToRow` now accepts the notification row-id key override.

### Browser parity evidence

- Re-captured all 22 canonical parity PNGs under
  `docs/parity-screenshots/`.
- Added flash videos:
  `docs/parity-screenshots/market-data/market-data-reflex-flash.webm`
  (464 KB) and
  `docs/parity-screenshots/market-data/market-data-nextjs-flash.webm`
  (240 KB).
- Added
  `docs/parity-screenshots/notification-jump.webm` (370 KB), showing
  Next.js market-data → PnL cross-page jump.
- Manual Next.js notification checks:
  same-page PnL jump highlighted 2 row DOM sections for `AAPL`, showed
  12 AG Grid flash-classed cells, and left pending storage null.
  Cross-page cold market-data → PnL did the same after URL change to
  `/dashboard/pnl/pnl-change`. Cross-page warm PnL → positions changed
  URL to `/dashboard/positions/positions`, highlighted 2 row DOM
  sections for `TKR0`, showed 11 flash-classed cells, and cleared
  pending storage.

### Verification matrix

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **13 suites / 69 tests** in 1.062 s |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 59 static routes |
| Backend pytest (sqlite override) | ✅ **175 passed, 2 skipped in 8.44 s** |

Desktop static export was not rerun in this pass because no
`src-tauri/` files changed.

### Exit criteria walkthrough

1. ✅ `:3000/dashboard/market-data/market-data` flashes continuously
   at the Reflex 2 s cadence with Auto Refresh ON.
2. ✅ Notification clicks navigate to the target page when needed and
   flash + sticky-highlight the matching row for ~1.8 s.
3. ✅ Same-page, cross-page cold, and cross-page warm notification
   scenarios passed in Playwright.
4. ✅ Verification matrix green with exact counts above.
5. ✅ Commits pushed through `adaca02`.
6. ✅ `continuations.md` and parity README updated.
7. ✅ Flash and notification-jump videos added under
   `docs/parity-screenshots/`.

## Current Status (2026-05-08 — Live-data feel parity + filter-bar mop-up + pytest restore)

### What landed this session

10 commits on `feat/nextjs-fastapi-rebuild`, working from the resume
prompt that called out (1) Auto Refresh + cell flash parity,
(2) filter-bar mop-up on the remaining position-date / trade-date
pages, (3) backend pytest coverage decision.

**Auto Refresh + cell flash (2 commits).**
- `components/grid/data-grid.tsx`: default `autoRefreshOn` to `true`
  whenever `showAutoRefresh` is set, mirroring Reflex's per-mixin
  `<module>_auto_refresh: bool = True`. New `defaultAutoRefreshOff`
  prop for opt-out. `lastUpdated` now bumps via an `isLoading
  true→false` watcher so the emerald pulse + timestamp render
  immediately on first load (was "—" until manual refresh). Removed
  the redundant bumps from `handleRefresh` and the polling tick
  (single source of truth).
- Cell flash: `getRowId` was unconditionally returning `"undefined"`
  for pages whose data lacks `id` (e.g. `pnl-summary`), collapsing
  every row onto the same id and silently breaking AG Grid's
  reconciliation pipeline. Fixed by detecting whether
  `rows[0][rowIdKey]` is present and only providing `getRowId` when
  it is — AG Grid then falls back to internal index-based matching,
  which fires cell flash correctly on same-length / same-order
  updates.
- Tests: `__tests__/dataGrid.test.tsx` now covers default-on switch,
  `defaultAutoRefreshOff`, `lastUpdated` bump, and
  `getRowId`-presence detection. Jest 12/50 in 1.007 s (was 12/46).

**Filter-bar mop-up (4 commits, 9 pages, 1 backend route).**
- `positions/{stock-position, warrant-position, bond-positions}` —
  position_date.
- `recon/{failed-trades, pnl-recon, risk-input-recon}` — trade_date.
- `positions/trade-summary` and `events/event-calendar` —
  start_date + end_date via `DateRangeFilterBar`.
- `compliance/beneficial-ownership` — added the `position_date`
  query param to `fastapi_backend/app/routes/compliance.py` (service
  + repo already accepted it), regenerated the OpenAPI client,
  applied the SingleDateFilterBar template. Added a passing pytest
  for the new filtered-response path.
- `events/event-stream` was on the original brief list but Reflex
  doesn't render a per-page filter bar there either — skipped to
  preserve parity (no regression).

**Backend pytest restoration (1 commit, +123 cases).**
User picked "Restore full coverage" via AskUserQuestion. Added
parametrize-driven 200 + 401 coverage for every route handler that
lacked a companion test:
- `test_pnl.py` — 5 endpoints (changes/summary/currency/full/kpi)
- `test_positions.py` — 5 endpoints
- `test_reconciliation.py` — 5 endpoints
- `test_risk_get.py` — 3 GET endpoints + invalid-date rejection
- `test_events.py` — 3 endpoints (calendar/stream/reverse-inquiry)
- `test_market_data.py` — 10 endpoints incl. category enum + invalid
  rejection, date-range, ticker filters, stock/{symbol} family
- `test_operations.py`, `test_orders.py` — 2 each
- `test_health.py` — unauthenticated health
- Extended existing `test_instruments`, `test_compliance`,
  `test_portfolio_tools`, `test_performance` with the 3+2+6+2
  endpoints they were missing.

Backend pytest: **175 passed, 2 skipped in 7.82 s** (was 52/52 in
0.81 s after this session's beneficial-ownership addition; 51/51
baseline at session start).

**Parity screenshot recapture (1 commit).** Re-shot the 4 grids
called out in the resume prompt (market-data/market-data,
positions/positions, pnl/pnl-change, risk/delta-change) with
auto-refresh ON on both apps. `docs/parity-screenshots/README.md`
updated to drop the now-stale "switch off by default" delta and note
the unchanged 7 pairs.

### Verification matrix (final)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **12 suites / 50 tests** in 1.007 s (was 12 / 46) |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 59 static routes |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 … pnpm build` | ✅ PASS — `out/` populated |
| Backend pytest (sqlite override) | ✅ **175 passed, 2 skipped in 7.82 s** (was 52 / 52) |

### Open items

- **AG Grid Enterprise license** — both apps still run on the trial
  license (watermark + console warning). User-owned procurement.
- **Mobile target** — no mobile scaffold yet; out of scope unless
  reprioritised.

---

## Previous Status (2026-05-07 — Grid + chrome runtime feature parity closed)

### What landed this session

18 commits on `feat/nextjs-fastapi-rebuild`, working from
`docs/plans/handoff-prompt-2026-05-07-feature-parity.md`. Closed every
gap in §4 of that brief.

**Toolbar features in `components/grid/data-grid.tsx` (8 commits).**
- Search clear (✕) button + focus ring (mirrors toolbar.py:212-225).
- Excel export — timestamped `<page>_YYYYMMDD_HHMM.xlsx`,
  selection-aware via `shouldRowBeSkipped` (toolbar.py:172-184 +
  export_helpers.py).
- Save / Restore / Reset Layout — `api.getState`/`setState` round-trip
  under `pmt:next:<gridId>_state`, auto-restores on `gridReady`,
  flex-stripping fix on `columnSizing.columnSizingModel` for v32+.
  Storage namespace decided up-front with the user (prefixed, not
  shared with Reflex's keys).
- Compact mode toggle — 42/48 ↔ 28/32 row/header heights, calls
  `autoSizeAllColumns` on enter / `sizeColumnsToFit` on exit (matches
  Reflex pixel-faithfully per user-confirmed scope).
- Auto-refresh switch + Last-Updated timestamp + live emerald pulse
  — 30 s default interval (user-confirmed).
- Generate dropdown — page-passed items + handler.
- Toolbar date picker — controlled single date with the calendar-glyph
  badge.
- Status bar (`agTotal / agFiltered / agSelected / agAggregation`),
  range selection (`cellSelection`), row numbers, multi-row checkbox
  selection, row-group panel, custom context-menu pass-through.

**Column helper extension (1 commit).** `tooltipField`,
`enableRowGroup`, `aggFunc`, `rowGroup`, `flex` exposed on every
helper in `components/grid/columns.ts`. Tooltip defaults to the
field name.

**Page-specific filter bar component (1 commit).**
`components/grid/filter-bar.tsx` exports `FilterBar` (generic),
`DateRangeFilterBar`, and `SingleDateFilterBar` mirroring
`filter_bar.py`.

**Grid registry + notification jump (1 commit).**
`lib/grid-registry.tsx` + `GridRegistryProvider` mounted in
`app/dashboard/layout.tsx`. Each `<DataGrid>` registers itself in
`onGridReady` and unregisters on unmount. The notification sidebar's
"go to details" arrow now calls `jumpToRow(gridId, rowId)` which
tries `getRowNode` (fast), falls back to `forEachNode` field-match by
`rowIdKey`, then `ensureNodeVisible('middle') + flashCells` and
applies the `.pmt-notification-highlight` amber-on-cream DOM class
(globals.css) at 0/100/350 ms with a 1.8 s clear. Test coverage in
`__tests__/gridRegistry.test.tsx`.

**Mass page-level wiring (3 commits).**
- `gridId="<page>_grid"` added to all 48 DataGrid pages via a Python
  one-shot — convention `<dashed-path>_grid` with one override
  (`special-terms` → `special_term_grid` to match the Reflex grid_id
  enum). Effect: every page now ships Excel / Save / Restore / Reset
  + persists state + accepts notification jumps.
- `showCompactToggle / showAutoRefresh / showRowNumbers /
  enableMultiSelect / enableCellFlash` added uniformly on all 48
  pages — matches Reflex's near-universal opt-in pattern (47-49 of
  49 reference grids set the same flags).
- `filterBar` prop wired to 5 representative pages
  (`compliance/monthly-exercise-limit`, `portfolio-tools/po-settlement`,
  `positions/positions`, `recon/pps-recon`, `recon/settlement-recon`)
  exercising both `position_date` and `trade_date` query params. The
  remaining routes that already accept those params follow the same
  template.

**AG Grid Enterprise install (1 commit).** Mid-session discovery via
playwright console: `statusBar / cellSelection / rowNumbers /
context menu` log AG Grid #200 module-not-registered errors under
Community-only and silently no-op. The 2026-05-07 brief said
`reflex_ag_grid` is Community, but
`Portfolio-Management-Tool-reflex/reflex_ag_grid/components/ag_grid.py:404`
ships `ag-grid-enterprise@35.0.1` as a hard dep. Surfaced to the
user → user picked "install Enterprise" → added
`ag-grid-enterprise@35.0.1`, registered `AllEnterpriseModule`,
switched export to `exportDataAsExcel` with a `.xlsx` filename. AG
Grid prints a trial-license watermark + console warning without a
key; Reflex runs in the same state. Procuring a license is a
follow-up.

**Parity screenshot re-capture (1 commit).** Three-terminal setup
with bypass flags ON, two playwright sessions at 1440×900. 22 PNGs
under `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`
re-captured. README rewritten:
- Removed the rows that called out missing toolbars / status bars.
- Added a "What now matches" section enumerating the 14
  toolbar / grid runtime features now present.
- Documented intentional remaining deltas (notification sidebar
  default state, auto-refresh switch state, dev-only "14 Issues"
  badge, trial-license watermark).

### §9 verification matrix (final)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **12 suites / 46 tests** in 0.86 s (was 11 / 35) |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 58 routes prerender as `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | ✅ PASS — `out/` populated |
| Backend pytest (sqlite override) | ✅ **51 passed in 0.79 s** |

### §10 (2026-05-07 brief) exit-criteria walkthrough

1. ✅ Every feature in §4.1 (toolbar) is in `<DataGrid>` and visible
   on every page that uses it.
2. ✅ Every feature in §4.2 (grid runtime) has a typed prop and
   renders correctly (Tier-1 `showStatusBar / enableRangeSelection /
   floating filters / no-rows overlay` default-on; Tier-2
   `enableCellFlash / showRowNumbers / enableMultiSelect /
   showRowGroupPanel` opt-in but mass-enabled in this pass).
3. ✅ Five §4.3 pages have a working filter bar wired through to the
   API; remaining pages share the same template.
4. ✅ Notification jump (§4.4) lands the matching row + flash via
   the new GridRegistry context.
5. ✅ 22 parity screenshots re-captured; README cleaned up.
6. ✅ `git status` clean, fully pushed.
7. ✅ TSC clean.
8. ✅ Jest 12 / 46.
9. ✅ Lint 0 / 0.
10. ✅ Web build PASS, 58 routes.
11. ✅ Tauri build PASS.
12. ✅ Backend pytest 51 / 51.
13. ✅ This entry.

**Total commits on branch: 108** (90 from prior sessions + 18 this
session).

### Open items (not blockers; surfaced for the user)

- **AG Grid Enterprise license**. Both apps run on the trial license
  (watermark + console warning). Procurement is out of scope.
- **Filter bars on remaining position-date / trade-date pages**.
  `positions/{stock,warrant,bond}-position`, `positions/trade-summary`,
  `recon/{failed-trades,pnl-recon,risk-input-recon}`,
  `events/event-stream` follow the same template. ~30 minutes of
  work each, plus matching backend route changes for any that don't
  yet accept the query param (only `compliance/beneficial-ownership`
  needs a backend addition for `position_date`).
- **Backend pytest count question** unchanged from prior sessions
  (51 vs the historical 116). Per existing instruction, leaving this
  for the user to decide.

### Reproduction (auth-bypass parity loop, unchanged)

```bash
# Terminal 1 — backend
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Next.js
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev   # → http://localhost:3000

# Terminal 3 — Reflex
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → http://localhost:3001/pmt/
```

---

## Previous Status (2026-05-06 — All §11 exit criteria green; 5 tracks closed)

### What landed this session

19 commits on `feat/nextjs-fastapi-rebuild`, working from
`docs/plans/handoff-prompt-2026-05-06.md`.

**Track 1 — `compliance/beneficial-ownership` field shape (1 commit).**
Added `BeneficialOwnershipRecord` TypedDict to
`pmt_core.models.compliance` (mirroring the Reflex `BeneficialOwnershipItem`),
rewrote the repository mock to emit the canonical 11 fields
(trade_date / ticker / company_name / nosh_reported / nosh_bbg /
nosh_proforma / stock_shares / warrant_shares / bond_shares /
total_shares), updated the service signature, and added
`tests/routes/test_compliance.py`. The Next.js page already declared
the right column shape; live cells now render values where they were
previously empty.

**Track 2 — six missing endpoints + grids (12 commits).** One
backend-route+test commit and one frontend-grid commit per page:
- `compliance/monthly-exercise-limit` (also added `MonthlyExerciseLimitRecord`
  TypedDict; rewrote mock to canonical 9-field shape).
- `portfolio-tools/{deal-indication, po-settlement, short-ecl}`
  (`PortfolioToolsService` already had the methods returning canonical
  shapes; just wired routes + tests + grids).
- `instruments/{instrument-data, instrument-term}` (same — service
  methods existed, just route + grid).

Each page passes the §5.3 acceptance gate: column set / headers /
order / pinned ticker / filter type / live API / empty + error states.

**Track 3 — pricer-warrant + pricer-bond full calculator port
(4 commits).** Surfaced scope question first, user picked the full
port. Wired `POST /api/risk/pricer/warrant` and
`POST /api/risk/pricer/bond` against existing
`pmt_core.services.pricing.{WarrantPricer,BondPricer}`. Pydantic
input/output models cover the full Term + Simulation field set; the
response includes the 2D chart series so the recharts-equivalent
component on the frontend has data without a second round-trip.
Frontend pages ship the §7-pattern multi-section forms (Terms /
Reset Parameters / Simulations / Outputs / chart-axis selector / chart)
with a self-contained inline-SVG payoff/yield-curve component (avoids
adding recharts as a new dependency). Backend pytest covers 200 + 401
paths for both routes.

**Track 4 — §11 exit criterion #12 parity screenshots
(1 commit + 22 PNGs).** Three-terminal setup with
`PMT_AUTH_DISABLED=true` and `NEXT_PUBLIC_AUTH_DISABLED=1`. Captured
22 PNGs at 1440×900 via `playwright-cli` for the 11 module canonical
landing pages (the first subtab in each module's `subtabs` array in
`lib/constants.ts`). `docs/parity-screenshots/README.md` documents
the capture environment, expected deltas, and reproduction recipe.

**Mid-track bug fix — OpenAPI baseURL bootstrap (1 commit).** While
capturing screenshots, every dashboard page surfaced "Failed to load
…" while the chrome rendered correctly. Root cause: pages that
imported a raw generated function (`positionsGetPositions`,
`complianceGetMonthlyExerciseLimit`, etc.) instead of one of the few
`withConfiguredClient`-wrapped re-exports never triggered
`ensureClientConfigured()`, so `client.setConfig` was never called and
fetches went to the relative path `/api/positions` → 404. Fix at
`lib/clientConfig.ts`: set `client.setConfig({ baseURL })` synchronously
at module load using `NEXT_PUBLIC_API_BASE_URL`. Desktop (Tauri) still
goes through the async path because the sidecar URL comes from a Rust
IPC call. After the fix, the 11 Next.js screenshots were re-captured
with live data.

**Doc commit (1).** Committed the in-flight `handoff-prompt-2026-05-06.md`
that was untracked at session start.

### §12 verification matrix (final)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **11 suites / 35 tests** in 0.84 s |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 58 routes (52 dashboard + auth + system) all `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | ✅ PASS — `out/` populated |
| `cargo check src-tauri/Cargo.toml` | ✅ PASS — `Finished dev profile` |
| Backend pytest (sqlite override) | ✅ **51 passed in 0.78 s** (was 33 → +14: 2 compliance, 4 portfolio-tools, 4 instruments, 4 risk pricer) |
| `grep mockData …/dashboard \| wc -l` | ✅ **0** |

### §11 exit criteria walkthrough

1. ✅ All 52 page rows in §6 (44 migrated + 8 scaffolds — pricer pages
   now full calculators, 6 grid pages now live grids).
2. ✅ Section B layout chrome (top nav, performance header, subtab nav,
   notification sidebar) committed in prior session and unchanged.
3. ✅ Section C AG Grid foundation committed in prior session.
4. ✅ `git status` clean on `feat/nextjs-fastapi-rebuild`, fully
   pushed to origin (`14dfa4f` is HEAD on both sides).
5. ✅ `grep -rE 'const mockData|mock_data|const data = \[' nextjs-frontend/app/dashboard | wc -l` → 0.
6. ✅ `pnpm exec tsc --noEmit` clean.
7. ✅ `pnpm exec jest --runInBand` — 11 suites / 35 tests passed
   (≥ 9 suites / ≥ 32 tests required).
8. ✅ `pnpm lint` — 0 errors / 0 warnings.
9. ✅ `pnpm build` (web) PASS — 58 static routes.
10. ✅ `TAURI_BUILD=1 …` static export PASS — `out/` populated.
11. ✅ Backend pytest — 51 passed.
12. ✅ Browser parity proof — 22 PNGs under
    `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`
    for all 11 modules; README documents expected deltas.
13. ✅ This entry is the §11 #13 update.

**Total commits on branch: 89** (70 from prior session + 19 this session).

### Open items (not blockers; surfaced for the user)

- **Pricer chart fidelity.** Reflex renders Plotly 3D surfaces; the
  Next.js chart is an inline-SVG 2D payoff/yield curve. Outputs match
  numerically because both wrap the same `pmt_core.services.pricing`.
  Adding a 3D component (Plotly.js or three.js) is out of scope for the
  parity gate but worth a follow-up issue if pixel-match on the chart
  matters.
- **Backend pytest count question (§17.1).** Brief flagged a previous
  `116/116` count; today we're at 51 (was 33 at session start; +14
  from Tracks 1–3). Route-level tests beyond what each track required
  were not restored. The user should decide whether to backfill the
  full 116 or stay lean now that the routes are exercised end-to-end
  via the parity screenshots.

### Reproduction (auth-bypass parity loop)

```bash
# Terminal 1 — backend
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Next.js
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev   # → http://localhost:3000

# Terminal 3 — Reflex
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → http://localhost:3001/pmt/
```

---

## Previous Status (2026-05-05 — Auth-bypass flag for parity work)

### What landed this session

**Backend (1 commit):** `Settings.AUTH_DISABLED` (alias `PMT_AUTH_DISABLED`, default `False`). `current_active_user` now wraps `fastapi_users.current_user(active=True, optional=True)` — when the flag is on it returns a synthetic `User` (id `00000000-0000-0000-0000-0000000000a1`, email `noauth@local`) without consulting the DB; when off, it preserves the existing 401 path. Single point of change — none of the 13 route files touched. New `tests/routes/test_auth_bypass.py` with monkeypatch on `settings.AUTH_DISABLED` brings pytest from **32 → 33 passed**. `fastapi_backend/.env.example` carries a commented `# PMT_AUTH_DISABLED=true` hint.

**Frontend (1 commit):** `NEXT_PUBLIC_AUTH_DISABLED` (default `0`) wired in three places. `getAuthToken()` returns the placeholder string `"no-auth"` when the flag is `1`, so the 50 dashboard pages keep their `if (!token) router.replace("/login")` code path but never redirect. `<DashboardAuthGate>` short-circuits its `useEffect` and renders children immediately, skipping the `/users/me` validation. `TopNavigation` hides the `User`/logout icon so the no-token shell can't accidentally call `logout()`. New `__tests__/authBypass.test.tsx` brings jest from **34 → 35 passed**.

### Verification matrix

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **11 suites / 35 tests** |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 52 dashboard routes prerender as `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | ✅ PASS |
| Backend pytest (sqlite override) | ✅ **33 passed in 0.45s** |
| Live `curl -i :18476/api/positions/` (no flag, no token) | ✅ **401 Unauthorized** |
| Live `curl :18476/api/positions/` (`PMT_AUTH_DISABLED=true`, no token) | ✅ 200 + JSON list |
| Live `curl :18476/api/notifications/` (`PMT_AUTH_DISABLED=true`, no token) | ✅ 200 + JSON list |
| Live `curl -H 'Authorization: Bearer no-auth' …/api/positions/` (flag on) | ✅ 200 + JSON list |

### Parity workflow with the bypass

```bash
# Terminal 1 — backend with auth bypass + sqlite override
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Next.js with auth bypass
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev   # → http://localhost:3000

# Terminal 3 — Reflex reference
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → http://localhost:3001/pmt/
```

Both env vars must default off again before any release build. The flag is wired only at the two integration points (`current_active_user` on the backend, `<DashboardAuthGate>` + `getAuthToken()` on the frontend) so flipping it back to `0` / removing it restores the old behavior with no further edits.

### What this unblocks

§11 exit criterion #12 — playwright side-by-side captures of the 11 modules into `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`. The 6 missing-endpoint scaffolds (`monthly-exercise-limit`, `deal-indication`, `po-settlement`, `short-ecl`, `instrument-data`, `instrument-term`) and the two pricer placeholder pages (`risk/pricer-warrant`, `risk/pricer-bond`) will not match the reflex grids and should be flagged in `docs/parity-screenshots/README.md` as expected deltas.

---

## Previous Status (2026-05-05 — Section D convergence pass)

### What landed this session

**Tauri stack (5 commits, A–E in §9):** backend desktop runtime + health endpoint, DB normalization for postgres/sqlite, frontend client-side auth refactor with `<DashboardAuthGate>`, the `src-tauri/` Rust shell, and the handoff brief + market-data live migration. Then rebased to absorb origin's `1f1f293` baseURL fix.

**Lint cleanup (1 commit):** flat-config fix so `.mjs` scripts run with node globals; `src-tauri/{target,gen}/**` now ignored. `pnpm lint` reports **0 errors / 0 warnings**.

**Section B — layout chrome (5 commits):** top-nav (NAV_BG #333333, blue underline + animate-pulse, lucide icon swap, 9px uppercase labels), subtab-nav (white bg, 28px, 9px uppercase tracking-tighter), notification sidebar (`/api/notifications/` backend, `NotificationsProvider` context, 4-tab filter, mark-read/dismiss, the bell badge wired up), performance header (KPI sparklines, portfolio summary cards, expandable Top Movers grid backed by 5 categories of `/api/market-data/top-movers`).

**Section C — AG Grid foundation (1 commit):** `ag-grid-community`+`ag-grid-react` v35.0.1 (matches the reflex `reflex_ag_grid` pin), `components/grid/data-grid.tsx` wrapper with themeQuartz + toolbar (refresh + search) + error/empty states, `components/grid/columns.ts` typed helpers (textColumn, numberColumn, currencyColumn, percentColumn, integerColumn, dateColumn). `__tests__/dataGrid.test.tsx` brings jest to 10 suites / 34 tests.

**Section D — page convergences (44 commits):** 42 grid pages migrated off mock data onto the live FastAPI client, plus 2 risk pricer scaffolds. The 6 grid-based "new" pages from §6 (monthly-exercise-limit, deal-indication, po-settlement, short-ecl, instrument-data, instrument-term) were scaffolded as Construction-icon placeholders that name the reflex grid + the missing FastAPI endpoint (§8). Subtab order/labels in `lib/constants.ts` now match the reflex reference (Reference Data label, full Portfolio Tools name, expanded subtab lists).

### Verification matrix (post-convergence)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ 10 suites / 34 tests / ~0.7s |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 52 dashboard routes prerender as `○ Static` |
| `TAURI_BUILD=1 … pnpm build` | ✅ PASS — `out/` populated |
| Backend pytest | ✅ **32 passed in 0.42s** (was 26; +3 notifications, +3 performance) |
| `grep mockData …/dashboard \| wc -l` | ✅ **0** |
| `cargo check src-tauri/Cargo.toml` | ✅ PASS — 23 crates compiled |
| Branch | `feat/nextjs-fastapi-rebuild` fully pushed to origin |

### Open issues / what's NOT done

1. **Pricer · Warrant / Pricer · Bond placeholder.** The reflex reference at `components/risk/pricer_{warrant,bond}_view.py` ships a 21-field Terms / Simulations / Outputs / chart layout. Scaffolded as Construction-icon placeholders; the form-based ports are queued.
2. **6 missing-endpoint scaffolds.** `monthly-exercise-limit`, `deal-indication`, `po-settlement`, `short-ecl`, `instrument-data`, `instrument-term` exist as routes + subtabs but render placeholders. §8 of the brief lists the FastAPI endpoints to add (`pmt_core.repositories.*` doesn't yet have a `risk` repository for the pricer pages — that's the larger blocker).
3. **§11 exit criterion #12 — parity screenshots.** Not yet captured. Reflex (`localhost:3001/pmt/`) and Next.js (`localhost:3000`) are both up; the brief calls for one screenshot per module saved under `docs/parity-screenshots/`. Skipped because it requires a logged-in playwright session and cosmetic differences are expected for the placeholder pages.
4. **`compliance/beneficial-ownership` field mismatch.** The reflex grid expects `nosh_reported / nosh_bbg / nosh_proforma / stock_shares / warrant_shares / bond_shares / total_shares`; the FastAPI stub currently returns the shared restricted-list / undertakings shape. Cells render empty until `pmt_core.repositories.compliance` emits the expected fields.
5. **Backend pytest count question (§17.1).** Brief notes a previous `116/116` count vs today's 32. I did not restore route-level tests beyond the new ones I added (`test_notifications.py`, `test_performance.py`); leaving that for the user to decide.

### Local dev DB workaround

`fastapi_backend/.env` ships with a postgres URL. For convergence work the dev backend was switched to sqlite:
```
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 ./.venv/bin/alembic upgrade head
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Health check then returns `{"status":"ok","runtime":"server","database_backend":"sqlite"}`. `pmt_core` returns mock data so sqlite vs postgres only affects the user/items tables, not dashboard data. Test creds are at `~/.pmt-test-account` (gitignored at home).

---

## Previous Status (2026-04-20)

### Tauri dev watcher verification
- Reviewed the `readdirp is not a function` diagnosis and confirmed the root cause was pnpm virtual-store corruption caused by an accidental npm-style install path. The repaired tree is healthy again:
  - `nextjs-frontend/node_modules` is back to `706M`
  - embedded transitive `chokidar` entries under `.pnpm/*/node_modules/chokidar` are symlinks again instead of copied directories
- Re-ran `Module._resolveFilename` instrumentation against `pnpm exec next dev --webpack` and confirmed:
  - parent: `.../.pnpm/chokidar@3.6.0/node_modules/chokidar/index.js`
  - resolved `readdirp`: `.../.pnpm/readdirp@3.6.0/node_modules/readdirp/index.js`
  - loaded export: `typeof function`
- That means the current runtime no longer falls through to the hoisted `.pnpm/node_modules/readdirp@4.x` path.

### Verification rerun results
- `pnpm --dir nextjs-frontend build`: PASS
- `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm --dir nextjs-frontend build`: PASS
- `pnpm --dir nextjs-frontend tauri dev`: PASS
  - no `readdirp` matches in the full log
  - `curl http://127.0.0.1:18475/api/health` returned `{"status":"ok","runtime":"desktop","database_backend":"sqlite"}`
- `pnpm --dir nextjs-frontend tauri build --debug`: PASS
  - completed static export, Rust compile, `.app` bundling, and DMG packaging
  - produced both:
    - `nextjs-frontend/src-tauri/target/debug/bundle/macos/Portfolio Management Tool.app`
    - `nextjs-frontend/src-tauri/target/debug/bundle/dmg/Portfolio Management Tool_0.0.8_aarch64.dmg`
- `pnpm --dir nextjs-frontend install --frozen-lockfile`: PASS, reported `Already up to date`
- Additional adjacency checks:
  - `pnpm --dir nextjs-frontend test`: PASS, `9/9` suites and `32/32` tests
  - `pnpm --dir nextjs-frontend lint`: FAIL, but unrelated to `readdirp`

### Important findings from this pass
- `nextjs-frontend/watcher.js` is not dead code.
  - `nextjs-frontend/start.sh` runs `node watcher.js`
  - `nextjs-frontend/Dockerfile` uses `start.sh`
  - a smoke test with `OPENAPI_OUTPUT_FILE` set confirmed the watcher fires on file change and invokes `pnpm run generate-client`
- No `preinstall` hard-block for npm was added in this pass.
  - Reason: the actual fix was already in place by removing `nextjs-frontend/package-lock.json` and restoring the pnpm virtual store with `pnpm install --frozen-lockfile`
  - Keep `pnpm-lock.yaml` as the only frontend lockfile
- Deleted the temporary investigation artifacts from `/tmp`:
  - `/tmp/trace-readdirp.mjs`
  - `/tmp/trace-readdirp2.cjs`
  - `/tmp/patch-readdirp.cjs`
  - `/tmp/unpatch-readdirp.cjs`
  - `/tmp/tauri-dev.log`

### Repo/doc changes made during this verification pass
- Updated `docs/plans/tauri-implementation-plan.md` to reflect the newly observed behavior:
  - `pnpm --dir nextjs-frontend tauri build --debug` now completes DMG packaging in this environment
  - the old note about stalling at `bundle_dmg.sh` is obsolete
- This continuation update is the only additional file edited in the repo during the save-log step.

### Residual issues to remember
- Frontend lint is currently red for reasons unrelated to the watcher fix:
  - unused `waitFor` import in `nextjs-frontend/__tests__/loginPage.test.tsx`
  - `no-undef` for Node globals in `nextjs-frontend/next.config.mjs`
  - `no-undef` for Node globals in `nextjs-frontend/src-tauri/scripts/build-sidecar.mjs`
  - `no-undef` for Node globals in `nextjs-frontend/src-tauri/scripts/run-next-with-tauri-env.mjs`
  - linting of generated `nextjs-frontend/src-tauri/target/**` artifacts after Tauri build
- Do not restore `nextjs-frontend/package-lock.json` unless there is hard evidence the repo has intentionally reverted from pnpm. Current evidence still says it was a stale footgun.

## Current Status (2026-03-22)

### PMT backend
- FastAPI route/service mismatches are fixed for risk, events, orders, and performance.
- Logout contract is normalized to `200` JSON in `fastapi_backend/app/users.py`.
- OpenAPI schema now reflects the live backend and regenerates the frontend client from the running API.
- Latest verified backend matrix: `116/116` PASS.
- Verified route count: `49` authenticated `/api/*` PMT routes, or `51` total PMT surface when `/items/` routes are included.

### PMT frontend
- `pnpm tsc`, `pnpm lint`, `pnpm build`, and `pnpm exec jest --runInBand` are green.
- Full frontend Jest now passes: `8/8` suites PASS, `33/33` tests PASS.
- Generated client compatibility aliases were added in `nextjs-frontend/app/clientService.ts`.
- Auth/register/reset/add-item flows were updated to return `redirectTo` from server actions and navigate in the client pages.
- Auth page route modules were split into reusable page-view components, while route-level Jest coverage was restored for login redirect and reset-confirm missing-token behavior.
- The first live dashboard module migration is complete for `/dashboard/market-data/market-data`.
- Market data now loads through the generated client with the auth cookie:
  - missing `accessToken` redirects to `/login`
  - `401/403` API failures redirect to `/login`
  - other client/backend failures throw instead of degrading to `[]`
- Browser-visible polish fixes were added:
  - favicon metadata and asset in `nextjs-frontend/app/layout.tsx` and `nextjs-frontend/public/favicon.svg`
  - auth form `autocomplete` hints on login/register/password-recovery/reset-confirm pages
- Latest pushed commit: `374a7a5` (`Fix auth page tests and market data failures`).

### PMT browser verification
- Latest Playwright browser rerun is green.
- Latest focused smoke rerun: `4/4` PASS.
- Auth pages verified: `/`, `/login`, `/register`, `/password-recovery`, `/password-recovery/confirm?token=testtoken`
- Invalid login shows `LOGIN_BAD_CREDENTIALS`.
- Weak registration shows password validation errors.
- Fresh register -> login -> dashboard redirect works.
- First live market-data page load works after login.
- Dashboard route matrix: `43/43` PASS.
- Deep link `/dashboard/risk/risk-measures`: PASS.
- Back/forward on Positions -> Trade Summary: PASS.
- Browser console/page errors for the app were cleared after favicon + autocomplete fixes.

### PMT Jest status
- Reviewed auth-action Jest regressions remain fixed.
- Auth page suites are green again and the route-level behaviors are covered:
  - login page redirect path
  - password-reset-confirm missing-token `notFound()` path
- Latest full frontend Jest run:
  - `pnpm exec jest --runInBand`
  - result: `8/8` suites PASS, `33/33` tests PASS
- Residual non-blocking test noise:
  - React 19 `act(...)` warnings still appear across the auth page suites
  - warnings are noisy but non-failing in the current setup

### AG Grid demo app
- AG Grid demo app work is complete enough for continuation purposes.
- Last recorded status:
  - `26/26` demo pages rendered
  - `next build` and `tsc` passed
  - backend/frontend demo app are not the current blocker

## Remaining Work

### High priority
1. Continue replacing PMT dashboard local mock data with live FastAPI calls through the generated client, preserving the current UI structure.
2. Keep `pnpm exec jest --runInBand`, `pnpm tsc`, `pnpm lint`, `pnpm build`, and focused browser smoke green as each dashboard module is migrated.

### Medium priority
1. Reduce or eliminate the remaining React 19 `act(...)` warning noise in the auth page Jest suites.
2. Add clearer loading and error states to PMT dashboard pages as more modules move off mocks.

## Environment Notes
- Repo root: `/Users/orbot/Developer/work/Portfolio-Management-Tool`
- Backend dev URL: `http://127.0.0.1:8000`
- Frontend dev URL: `http://127.0.0.1:3000`
- PostgreSQL is required for the backend.
- Local PostgreSQL on `localhost:5432` worked in recent runs even when Docker was unavailable.
- Backend virtualenv may need recreation with `uv` if broken.
- Frontend schema/client generation now depends on the live backend being up.

## Useful Commands

### Backend
```bash
cd fastapi_backend
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
find app -name '*.py' -print0 | xargs -0 ./.venv/bin/python -m py_compile
./.venv/bin/python -c "from app.main import app; print('OK')"
```

### Frontend
```bash
cd nextjs-frontend
pnpm dev
pnpm tsc
pnpm lint
pnpm build
pnpm generate-client
pnpm exec jest --runInBand
```

### Browser E2E
```bash
playwright-cli open http://127.0.0.1:3000/login
```

## Continuation Prompt: PMT Dashboard API Wiring

Use this in the next conversation if you want another coder to continue from the current state:

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool.

Current state:
- Backend matrix is green: 116/116 PASS.
- Frontend build checks are green: pnpm tsc, pnpm lint, pnpm build.
- Full frontend Jest is green: 8/8 suites PASS, 33/33 tests PASS.
- Generated OpenAPI client is synced to the live backend schema.
- Browser smoke is green for:
  - /login invalid credentials
  - /register weak password
  - register -> login -> dashboard redirect
  - /dashboard/risk/risk-measures deep link
- Earlier dashboard route matrix is green: 43/43 PASS.
- The first live dashboard migration is complete for /dashboard/market-data/market-data using the generated client.
- Market-data auth/load handling is now correct:
  - missing token redirects to /login
  - 401/403 redirects to /login
  - other client/backend failures throw
- Latest pushed commit is 374a7a5 ("Fix auth page tests and market data failures").

Your tasks:
1. Migrate the next PMT dashboard module from local mock data to live API calls through the generated client without changing the current UI structure.
2. Re-run pnpm exec jest --runInBand and report exact final counts after each meaningful migration step.
3. Re-run pnpm tsc, pnpm lint, pnpm build, and a focused browser smoke test to ensure no regression.
4. If time allows, reduce the remaining React 19 act(...) warning noise in the auth page Jest suites.

Constraints:
- Do not break the already-green backend matrix, browser auth flow, dashboard route matrix, or full frontend Jest pass.
- Keep the generated OpenAPI client sourced from the live backend.
- Report exact PASS/FAIL counts, not summaries without numbers.
```
