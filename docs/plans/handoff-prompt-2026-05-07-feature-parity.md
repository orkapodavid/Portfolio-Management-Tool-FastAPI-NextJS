# Portfolio Management Tool — Grid & Chrome Feature-Parity Handoff (2026-05-07)

This brief follows `docs/plans/handoff-prompt-2026-05-05.md` (source of truth) and `docs/plans/handoff-prompt-2026-05-06.md` (track-1-through-5 supplement). The 2026-05-06 session closed §11 exit criteria #1–#13 and shipped all 52 pages on the Next.js side calling live FastAPI endpoints with the same column shapes as Reflex.

**What's left:** the *toolbar* and *grid runtime features* that the Reflex side gets for free via `app/components/shared/ag_grid_config/` but that the Next.js `<DataGrid>` wrapper never grew. Walk both apps for a second pass, find every missing UX affordance, plan it, build it once in the shared wrapper, then iterate the per-page convergence loop until every screenshot pair is feature-identical.

---

## 1. Mission

Bring the Next.js dashboard to **runtime feature parity** with the Reflex reference, not just data-shape parity. Specifically:

> A user clicking around the same page in both apps should be able to perform every action — search, sort, filter, group, save layout, restore layout, reset, compact, auto-refresh, export, range-select, copy, jump-to-row from notification — and see every piece of status (row count, filtered count, selected count, aggregations, last-updated, live indicator) the same way.

When that's true on every page in §6 of the 2026-05-05 brief, the convergence is done in earnest. Until then, keep cycling.

---

## 2. Verified state at session start (2026-05-06 23:55)

| Check | Result |
|---|---|
| Branch | `feat/nextjs-fastapi-rebuild`, fully pushed (HEAD `e68f5ae`) |
| Working tree | clean |
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | **11 suites / 35 tests** in 0.84 s |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` (web) | PASS — 58 routes prerender as `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | PASS — `out/` populated |
| `cargo check src-tauri/Cargo.toml` | PASS |
| Backend pytest (sqlite override) | **51 passed** in 0.78 s |
| `grep mockData …/dashboard \| wc -l` | 0 |
| Total commits on branch | 90 |

Auth-bypass flags `PMT_AUTH_DISABLED=true` (backend) and `NEXT_PUBLIC_AUTH_DISABLED=1` (frontend) are wired and let you compare `:3000` and `:3001` without logging in.

22 parity screenshots are committed under `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png` — open them side-by-side and you can see every gap listed in §4 below at a glance.

---

## 3. Hard rules (carry over from prior briefs + new)

All rules from §13 of the 2026-05-05 brief still hold. Plus:

1. **Build the toolbar features in the shared wrapper, not per-page.** Reflex did this via `components/shared/ag_grid_config/`. The Next.js equivalent is `nextjs-frontend/components/grid/data-grid.tsx` plus optional helpers under `nextjs-frontend/components/grid/`. New features go there, then every dashboard page picks them up automatically.
2. **The Reflex source for each feature is `Portfolio-Management-Tool-reflex/app/components/shared/ag_grid_config/`** — read it, don't guess. Files of interest:
   - `toolbar.py` — generate / refresh / search / export / save / restore / reset / compact / auto-refresh / last-updated buttons, exact tailwind classes
   - `grid_factory.py` — `create_standard_grid` factory with status bar, range selection, floating filters, no-rows overlay, cell flash, row numbers, multi-select, compact mode, notification jump
   - `state_persistence.py` — `getState()/setState()` JS that backs save/restore/reset
   - `constants.py` — `STANDARD_STATUS_BAR`, `COMPACT_ROW_HEIGHT/HEADER_HEIGHT`, `NO_ROWS_TEMPLATE`
   - `context_menu.py` — right-click custom items (Rerun/Kill, copy, export)
   - `export_helpers.py` — Excel/CSV exporters, timestamped filenames, "selected if any selected, all otherwise"
3. **Don't add AG Grid Enterprise.** The Reflex side uses Community via `reflex_ag_grid` (verify with `grep reflex_ag_grid Portfolio-Management-Tool-reflex/uv.lock`). Match that. If a feature genuinely requires Enterprise, surface to the user before installing — Enterprise is license-gated.
4. **You may install tooling.** Playwright (already installed for skill use), Vitest if jest gets in the way, `vitest-axe` for accessibility, `react-aria` if a control needs it. Surface dependency additions in the commit body. Avoid duplicating what already ships with `ag-grid-community`.
5. **Auth-bypass flags must default OFF in any committed env example.** Use them only at runtime via the three-terminal recipe in §6 below.
6. **Cite exact numbers between commits.** `X passed, T seconds`, never "all green".
7. **Commit per feature, then per page that adopts it.** Toolbar Save/Restore/Reset is one commit; the 50 pages picking it up are one more (often automatic since they all use the wrapper).
8. **The pricer pages (`risk/pricer-warrant`, `risk/pricer-bond`) are not grids.** They were ported in 2026-05-06 and are out of scope for grid-feature parity. Their chart is an inline SVG vs Reflex's Plotly 3D — that's a separate decision and is documented in `docs/parity-screenshots/README.md`.

---

## 4. Known feature gaps (start here — not exhaustive)

This is what was visible from the 22 parity screenshots and from reading `Portfolio-Management-Tool-reflex/app/components/shared/ag_grid_config/` in full. Treat this as the seed; do a second walk of every page yourself and add to it.

### 4.1 Toolbar gaps

| Reflex feature | Status in Next.js `<DataGrid>` | Where it lives in Reflex |
|---|---|---|
| Search input with **clear (✕)** button | Search is there; no clear button | `toolbar.py:202-225` |
| **Excel export** button (timestamped filename, selection-aware) | **Missing** | `toolbar.py:172-184`, `export_helpers.py:128-184` |
| **Save Layout** button (localStorage `getState()`) | **Missing** | `toolbar.py:266-278`, `state_persistence.py:77-90` |
| **Restore Layout** button (`setState()` with flex-removal fix) | **Missing** | `toolbar.py:280-291`, `state_persistence.py:92-114` |
| **Reset Layout** button (`resetColumnState`, `setFilterModel(null)`, clear localStorage) | **Missing** | `toolbar.py:292-303`, `state_persistence.py:116-124` |
| **Compact mode toggle** (28 px row / 32 px header) | **Missing** | `toolbar.py:305-391`, `constants.py:38-39` |
| **Auto-refresh switch** (with live pulse indicator + last-updated timestamp) | **Missing** | `toolbar.py:411-488` |
| **Generate dropdown** (used on a few pages — see `pnl/pnl_summary_page.py`) | **Missing** | `toolbar.py:131-170` |
| **Date picker** in the toolbar (used on compliance, portfolio-tools, etc.) | **Missing** (some pages have a separate position-date bar above the grid; that's a related-but-different control) | `toolbar.py:227-260` |
| Auto-restore on page-load (polling-based for SPA) | **Missing** | `state_persistence.py:127-159` |

### 4.2 Grid runtime gaps

| Reflex feature | Status in Next.js `<DataGrid>` | Where it lives in Reflex |
|---|---|---|
| **Status bar** (`agTotalRowCountComponent`, `agFilteredRowCountComponent`, `agSelectedRowCountComponent`, `agAggregationComponent`) | **Missing** | `constants.py:8-15`, `grid_factory.py:108-110` |
| **Range selection** (`enableRangeSelection`, `cellSelection`) | **Missing** | `grid_factory.py:112-115` |
| **Floating filters row** under headers | Already on (`floatingFilter: true` in DEFAULT_COL_DEF) — verify the styling matches | `constants.py:18-23` |
| **No-rows overlay** styling | Basic version exists; mirror exact Reflex template | `constants.py:33-35` |
| **Cell flash** on value change (for real-time grids) | **Missing** | `grid_factory.py:121-123` |
| **Row numbers** column (opt-in) | **Missing** | `grid_factory.py:125-127` |
| **Multi-row selection with checkboxes** (opt-in) | **Missing** | `grid_factory.py:129-131` |
| **Row grouping panel** (`row_group_panel_show: 'always'`, `group_default_expanded: -1`) | **Missing** | per-page in reflex, e.g. `monthly_exercise_limit_ag_grid.py:208-209` |
| Per-column **`enableRowGroup`** + **`aggFunc`** (sum/avg) | Column helpers don't expose these | reflex column defs, e.g. `monthly_exercise_limit_ag_grid.py:88-100` |
| **Tooltip fields** (`tooltipField`) on common columns | Column helpers don't expose this | every reflex grid |
| **Context menu** (right-click → custom Rerun/Kill + built-in copy/export) | **Missing** | `context_menu.py` |
| **Loading overlay** template (`overlayLoadingTemplate`) | Default AG Grid spinner is shown via `loading={true}`; matches roughly | `grid_factory.py:144-145` |
| **Notification jump** (open notification → grid scrolls + flash-highlights the matching row) | **Missing** | `grid_factory.py:138-141` + reflex `NotificationSidebarState.execute_pending_highlight` |
| Per-row **`getRowId`** with delta detection (already in Next.js wrapper, but confirm every page passes the right `rowIdKey`) | Partial | `grid_factory.py:97-104` |

### 4.3 Page-specific filter bars

Several Reflex pages render a date / position-date filter bar between the toolbar and the grid (see `monthly_exercise_limit_ag_grid.py:_position_date_bar`, `beneficial_ownership_ag_grid.py:_position_date_bar`, `po_settlement_ag_grid.py`). These are not part of the toolbar — they're a separate strip. Audit which pages need them:

- `compliance/beneficial-ownership` — position date
- `compliance/monthly-exercise-limit` — position date
- `portfolio-tools/po-settlement` — position date
- `portfolio-tools/cb-installments` — position date
- `portfolio-tools/excess-amount` — position date
- `portfolio-tools/reset-dates` — multi-field filter (ticker, date range, frequency, reset month/day, reset up/down)
- `pnl/*`, `risk/*`, `recon/*` — most have a `trade_date` filter

When the filter changes, the page should call its load function with the new query param. The backend already accepts `position_date` / `trade_date` Query params on most routes — wire them through.

### 4.4 Notification sidebar interaction

Reflex notifications can carry a "jump-to-row" payload: clicking a notification scrolls the relevant grid into view, expands any row groups containing it, selects the row, and flash-highlights it for ~1.5 s. The Next.js notification sidebar exists but is read-only. Ports to do:

- Wire each `<DataGrid>` to register itself with a global "grid registry" (keyed by `grid_id`).
- When a notification is clicked, look up the registered grid → call `ensureIndexVisible(rowNode)` + flash.
- Reflex source: `app/states/notifications/notification_sidebar_state.py`, `execute_pending_highlight`.

### 4.5 Chrome / global gaps (lower priority but present)

- The Reflex top nav has a small `PMT` glyph + the active module's underline animation has a slight `animate-pulse`. Verify the Next.js side matches.
- The Reflex performance header has expandable "Top Movers" — confirm Next.js parity.
- Reflex has a small live "websocket connected" indicator next to the bell. Next.js doesn't have one (and shouldn't need one — backend is REST polling; verify Reflex's actually does anything).

---

## 5. Methodology — feature-first then page-first

Don't migrate page-by-page this round. Migrate **feature-by-feature** in the shared wrapper, then verify per-page.

### 5.1 Feature loop (do this once per feature in §4)

```
  ┌────────────────────────────────────────────────────────────────────┐
  │ For each feature in §4:                                            │
  │                                                                    │
  │   ① REFERENCE  → read the exact Reflex source (file paths in §4). │
  │                  Note JS, tailwind classes, and AG Grid API calls. │
  │   ② SCAFFOLD   → add the toolbar element / grid prop to            │
  │                  components/grid/data-grid.tsx (or a new           │
  │                  helper next to it). Mirror Reflex tailwind.       │
  │   ③ WIRE       → handle clicks/changes via AG Grid API             │
  │                  (gridApi.getState/setState/exportDataAsExcel/…).  │
  │   ④ TEST       → add a jest test if behavior is testable in jsdom  │
  │                  (e.g. localStorage save/restore, search clear);   │
  │                  use playwright-cli for browser-only behaviors     │
  │                  (compact toggle, auto-refresh, live indicator).   │
  │   ⑤ VERIFY     → run §12 verification matrix; cite numbers.        │
  │   ⑥ COMPARE    → playwright-cli, side-by-side. Diff toolbar.       │
  │   ⑦ COMMIT     → one feature, one commit.                          │
  └────────────────────────────────────────────────────────────────────┘
```

### 5.2 Page loop (after §4 features are in)

```
  ┌────────────────────────────────────────────────────────────────────┐
  │ For each page in §6 of the 2026-05-05 brief:                       │
  │                                                                    │
  │   ① CONFIRM    → the page's columns expose every Reflex helper     │
  │                  (tooltipField, enableRowGroup, aggFunc).          │
  │   ② FILTERS    → wire any page-specific filter bar (§4.3) and     │
  │                  pass through to the load function.                │
  │   ③ COMPARE    → playwright-cli screenshot pair; visually diff     │
  │                  with the existing reference under                 │
  │                  docs/parity-screenshots/.                         │
  │   ④ FIX        → if a delta is functional (not cosmetic), fix      │
  │                  before moving on.                                 │
  │   ⑤ COMMIT     → one page, one commit.                             │
  │                                                                    │
  │   When all pages pass: re-capture the 22 parity screenshots in     │
  │   one commit.                                                      │
  └────────────────────────────────────────────────────────────────────┘
```

### 5.3 Per-feature acceptance gate (the "is it done?" check)

A feature is converged when:

| Aspect | Required state |
|---|---|
| **Visual** | Looks the same as Reflex within ~5 px on a 1440×900 capture (cosmetic Tailwind drift OK; control type/position must match) |
| **Behavior** | Click/keypress produces the same outcome (state save/restore round-trips; export downloads a file with the right name) |
| **Persistence** | If the feature stores state, the storage key is unique per page and survives a reload |
| **Accessibility** | aria-labels and keyboard navigation match (Tab/Shift-Tab, Enter to activate) |
| **Verification matrix** | TSC clean, Jest green, web build PASS — after the feature is in the shared wrapper |

### 5.4 Per-page acceptance gate

Use §5.3 of the 2026-05-05 brief unchanged, plus this addition:

| Aspect | Required state |
|---|---|
| **Toolbar features** | Every relevant toolbar button from §4.1 is rendered and functional |
| **Grid features** | Status bar, range selection, floating filters, no-rows overlay are visible |
| **Filter bar** | Page-specific filter bar (§4.3) is rendered if Reflex has one; values flow through to the API |
| **Notification jump** | Clicking a relevant notification scrolls + flashes the right row |

---

## 6. Three-terminal setup (auth-bypass parity loop)

```bash
# Terminal A — backend with auth bypass + sqlite
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal B — Next.js with auth bypass
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev    # → http://localhost:3000

# Terminal C — Reflex reference
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                        # → http://localhost:3001/pmt/
```

Health-check before any compare:
- `curl http://127.0.0.1:8000/api/health` → `{"status":"ok",…,"database_backend":"sqlite"}`
- `curl -I http://localhost:3000` → 200
- `curl -I http://localhost:3001/pmt/` → 200

---

## 7. Browser comparison

Use the `playwright-cli` skill (already installed on this machine — see `.claude/skills/playwright-cli/`). Two named sessions, viewport 1440×900:

```bash
playwright-cli -s=reflex open --browser=chrome
playwright-cli -s=reflex resize 1440 900
playwright-cli -s=nextjs open --browser=chrome
playwright-cli -s=nextjs resize 1440 900

# For each page-feature compare:
playwright-cli -s=reflex goto http://localhost:3001/pmt/<module>/<page>
playwright-cli -s=reflex screenshot --filename=docs/parity-screenshots/<module>/<page>-reflex.png
playwright-cli -s=nextjs goto http://localhost:3000/dashboard/<module>/<page>
playwright-cli -s=nextjs screenshot --filename=docs/parity-screenshots/<module>/<page>-nextjs.png
```

For interactive feature checks (compact toggle, save/restore, range selection, right-click context menu), drive both sessions through the action sequence:

```bash
# Example: Save/Restore round-trip
playwright-cli -s=nextjs goto http://localhost:3000/dashboard/positions/positions
playwright-cli -s=nextjs snapshot
# Click the column-resize handle on a header to change a width
playwright-cli -s=nextjs drag e<header-resize-handle> e<somewhere-else>
playwright-cli -s=nextjs click e<save-button-ref>
playwright-cli -s=nextjs reload
# Verify the column width persisted
playwright-cli -s=nextjs snapshot
```

You may install additional Playwright add-ons (e.g. `@axe-core/playwright` for accessibility audits) — surface in the commit body.

---

## 8. Tooling you can install

You're explicitly authorized to install these without surfacing if needed; surface anything beyond:

- **`@axe-core/playwright`** — accessibility checks during browser comparison
- **`@testing-library/user-event`** — for jest interaction tests on the toolbar
- **`fake-indexeddb`** — if a feature needs IndexedDB instead of localStorage
- **A small inline icon set** (already have `lucide-react` — prefer those icons over adding a second pack)
- **`@tanstack/react-query`** — if auto-refresh polling needs cache management. Recommend NOT adding this; a `setInterval` in `useEffect` is enough for parity. Ask before adding state management libraries.

Do **not** add without surfacing first:
- AG Grid Enterprise (license-gated)
- A second chart library (recharts wasn't added in 2026-05-06; the inline SVG payoff component is enough for the pricer chart parity)
- A second grid library
- A new auth library

---

## 9. Verification matrix (run between commits, cite exact numbers)

```bash
# Frontend
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand
pnpm lint
pnpm build

# Desktop static export (only when src-tauri/ or shared infra changes)
TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 \
  NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build

# Backend
cd ../fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q

# Tauri shell (only when src-tauri/ changed)
cargo check --manifest-path \
  /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend/src-tauri/Cargo.toml
```

Expected steady state at each commit:
- TSC: clean
- Jest: ≥ 35 tests (more as new feature tests land)
- Lint: 0 / 0
- Web build: PASS, 58 routes (or more if you add pages — unlikely)
- Backend pytest: ≥ 51 (more as new pytest cases land)

Always cite numbers — never "all green".

---

## 10. Exit criteria (the "stop" conditions)

You are **done** when **all** of the following are true:

1. Every feature in §4.1 is in `<DataGrid>` and visible on every page that uses it.
2. Every feature in §4.2 has a typed prop on `<DataGrid>` (default-on for the four Reflex Tier-1 features) and renders correctly.
3. Every page in §4.3 has a working filter bar wired through to the API.
4. Notification jump (§4.4) works: clicking a notification scrolls + flashes the matching grid row.
5. The 22 parity screenshots are re-captured (one commit) and the README is updated to remove the rows that previously called out missing toolbars / status bars.
6. `git status` clean on `feat/nextjs-fastapi-rebuild`, fully pushed.
7. `pnpm exec tsc --noEmit` clean.
8. `pnpm exec jest --runInBand` passes; cite exact suite/test counts.
9. `pnpm lint` 0 / 0.
10. `pnpm build` (web) PASS; cite route count.
11. `TAURI_BUILD=1 …` PASS.
12. Backend pytest passes; cite count.
13. `continuations.md` has a 2026-05-XX entry summarizing the feature-parity pass.

---

## 11. Open questions to surface (do not assume)

1. **AG Grid Enterprise.** Confirm with the user whether it's permitted before adding any feature that depends on it (set filter — `agSetColumnFilter`, master-detail, status-bar aggregations, sidebar). Reflex uses `reflex_ag_grid` Community; some features Reflex *appears* to have (`agSetColumnFilter` in column defs) silently degrade to the default text filter under Community.
2. **Auto-refresh interval.** Reflex doesn't show the interval in the toolbar — the switch just toggles a backend-driven cycle. Pick a sensible default (30 s) and surface to the user before committing if it changes any backend behavior.
3. **Notification jump grid registry.** The Reflex implementation uses a single React tree, so it can call `gridApi` directly. Next.js will need a global registry (e.g. `useGridRegistry()` context) — surface the design before implementing if you're unsure.
4. **Column auto-fit.** Reflex calls `autoSizeAllColumns()` on entering compact mode and `sizeColumnsToFit()` on leaving. Confirm with the user whether the Next.js side should do the same (it changes the visible layout).
5. **localStorage namespace.** Reflex keys are like `pnl_grid_state` and `beneficial_ownership_grid_state`. Decide whether Next.js should match keys exactly (so a user switching between the two apps shares state) or prefix them (`pmt:next:pnl_grid_state`) to avoid collision. Surface before committing.
6. **Backend pytest coverage.** Brief `§17.1` flagged a previous `116/116` count vs today's 51. Don't backfill without asking.

---

## 12. Recovery from interruption

Standard contract from §14 of the 2026-05-05 brief. After a crash:

1. `git status` is the truth — uncommitted is half-done (finish or stash).
2. `git log --oneline -50` shows what landed; cross-reference §4 of this brief.
3. Resume from the first unchecked feature.
4. Run §9 verification matrix. If anything is red, fix before adding new work.

---

## 13. Resume prompt (paste into a fresh session)

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read these in order before doing anything:
1. docs/plans/handoff-prompt-2026-05-05.md — source of truth (convergence loop §5, per-page gate §5.3, exit criteria §11, verification matrix §12)
2. docs/plans/handoff-prompt-2026-05-06.md — track-1-through-5 supplement (auth-bypass workflow, OpenAPI-baseURL bootstrap)
3. docs/plans/handoff-prompt-2026-05-07-feature-parity.md — THIS BRIEF, the grid + chrome runtime feature-parity pass
4. continuations.md — most recent entry first

Current state (2026-05-07): 90 commits landed; jest 11/35; pytest 51/51; lint 0/0; tsc clean; web + Tauri build PASS; tree clean; fully pushed.

Mission: drive runtime UX parity between :3000 (Next.js) and :3001/pmt/ (Reflex). The data shapes already match; what's missing is toolbar buttons (Excel / Save / Restore / Reset / Compact / Auto-refresh / Last-Updated), grid runtime features (status bar, range selection, row numbers, multi-select, row grouping, cell flash), page-specific filter bars (date pickers above grids), and notification-jump-to-row.

Methodology: feature-first in components/grid/data-grid.tsx, then page-first to wire each page's filter bar. Read the Reflex source at Portfolio-Management-Tool-reflex/app/components/shared/ag_grid_config/ — that's the spec for every toolbar/grid feature.

Hard rules:
- Build features in the shared wrapper, not per-page.
- Don't add AG Grid Enterprise (Reflex is Community-only).
- May install playwright add-ons / testing libs; surface anything else.
- Cite exact numbers (X passed, T seconds). Never just "all green".
- Commit per feature, then per page that adopts it. Push every 3-5 commits.
- The pricer pages (risk/pricer-warrant, risk/pricer-bond) are not grids — out of scope for this pass.

Three-terminal setup with bypass flags ON (see §6). Use playwright-cli with two named sessions (-s=reflex, -s=nextjs) at 1440x900 viewport.

Ask before:
- Adding AG Grid Enterprise.
- Adding any state-management library (zustand, redux, react-query) for auto-refresh.
- Backfilling backend pytest beyond what each feature requires.
- Picking a localStorage key scheme that overlaps with Reflex's keys.

Run §9 verification matrix between commits and report exact PASS/FAIL counts.

Exit criteria in §10 — every gap in §4 closed; the 22 parity screenshots re-captured and README cleaned up; verification matrix all green with cited numbers; continuations.md entry appended.
```

---

End of 2026-05-07 grid feature-parity handoff.
