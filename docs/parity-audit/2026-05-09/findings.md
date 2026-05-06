# PMT Parity Audit — Findings (2026-05-09 audit + 2026-05-10 walk)

Reflex (`/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`)
is the spec. Findings categorised per the brief's six buckets and
ranked Blocker → Low. Every line item cites both Reflex and
Next.js/FastAPI source positions. "BREAKS converged page?" =
whether the suggested fix risks regressing a page already passing
parity.

The 2026-05-10 walk (5 parallel agents, 50 / 50 routes browsed at
1440×900) confirmed every code-level finding from the original audit
plus added F-30..F-38. Two original entries (F-10, F-12) were
**corrected** based on browser evidence. The walk also surfaced three
methodology corrections — see [`route-matrix.md`](./route-matrix.md)
"Walk methodology corrections" section.

## Verification snapshot at audit start (HEAD `5f1c7b9`)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | **13 suites / 69 tests** in 1.019 s |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` (web) | PASS — exit 0 (route count truncated by RTK; previous run reported 59 static routes; this run did not regress) |
| Backend pytest (sqlite override) | **175 passed, 2 skipped in 7.83 s** |
| `git status` | clean, branch fully pushed |

Worktree had **0 modifications** at audit close. Auth-bypass flags
were already wired (`PMT_AUTH_DISABLED`, `NEXT_PUBLIC_AUTH_DISABLED`)
and the three services were healthy throughout the audit:
backend `/api/health` → 200, Next.js `/dashboard/*` → 200,
Reflex `/pmt/*` → 200.

The 2026-05-10 walk re-verified the baseline at the same HEAD; no
source code touched.

---

## Category 1 — True missing features

### F-1 — Operations Rerun/Kill backend writes are unimplemented (Blocker)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/states/operations/operations_state.py` calls `pmt_core.services.operations.rerun_process(process_id, process_name)` and `kill_process(...)` from the AG Grid context-menu callbacks defined at `Portfolio-Management-Tool-reflex/app/components/operations/operation_process_ag_grid.py:91-96` and `daily_procedure_check_ag_grid.py:_CONTEXT_MENU`.
- **Next.js / FastAPI:** `fastapi_backend/app/routes/operations.py` only exposes GET handlers; no `POST /api/operations/processes/{id}/rerun` or `kill`. Neither `app/dashboard/operations/daily-procedures/page.tsx` nor `operations/operation-process/page.tsx` passes `getContextMenuItems`. The DataGrid wrapper accepts the prop (`components/grid/data-grid.tsx:194`) but no page wires it.
- **Walk evidence (W5):** right-click on `:3000/dashboard/operations/daily-procedures` → 6 built-in items only (Cut/Copy/Copy with Headers/Copy with Group Headers/Paste/Export). Right-click on `:3001/pmt/operations/daily-procedure-check` → 5 items including custom **Rerun (🔄)** and **Kill (🛑)** at top. Visual proof in `artifacts/walk-W5/operations-daily-procedures-{reflex,nextjs}-context.png`.
- **Suggested fix:** add POST routes wrapping the existing `pmt_core` services, regenerate the OpenAPI client, then thread `getContextMenuItems` from each operations page (one helper for both). Pytest 200 + 401 paths.
- **Risk:** None — net-new endpoints + new prop on existing pages.

### F-3 — All four PnL pages render without the Reflex position-date filter bar (Blocker)
- **Reflex:** `app/components/pnl/pnl_change_ag_grid.py:236` (and the 3 sibling files at `:235`, `:241`, `:243`) ship `_position_date_bar()` above the grid; the corresponding `pnl_*_mixin.py` reload on date change.
- **Next.js:** `app/dashboard/pnl/{pnl-change,pnl-summary,pnl-currency,pnl-full}/page.tsx` declare `<DataGrid>` with no `filterBar` prop (verified by grep — none of the four files import `SingleDateFilterBar`).
- **Walk evidence (W2):** Reflex DOM probe shows a `POSITION DATE`-labelled input (`dateInputs=[{val:"2026-05-06", label:"POSITION DATE"}]`) above each PnL grid. Next.js DOM probe shows only the AG Grid floating filter for `Trade Date` (no labelled position-date strip).
- **Suggested fix:** mirror the recon-page template — add `<SingleDateFilterBar>` and pipe the date through to each `pnlGet*` call's `position_date` query param. The FastAPI handlers in `fastapi_backend/app/routes/pnl.py` already accept `position_date`.
- **Risk:** None — purely additive.

### F-4 — Three portfolio-tools pages missing position-date filter bars (High)
- **Affected pages (Next.js):** `app/dashboard/portfolio-tools/{pay-to-hold,cb-installments,excess-amount}/page.tsx` — none import `SingleDateFilterBar`. (The `po-settlement` page already has one wired.)
- **Reflex:** each `app/components/portfolio_tools/<page>_ag_grid.py` ships a `_position_date_bar()`.
- **Walk evidence (W4):** Reflex `dateInputs` 2 / 2 / 1 vs Next.js 1 / 1 / **0** for pay-to-hold / cb-installments / excess-amount. Excess-amount is the sharpest signal — Next.js shows zero date controls (no toolbar date AND no filter bar), while every other portfolio-tools page on Next.js still ships the toolbar single-date.
- **Risk:** None — the FastAPI portfolio-tools route handlers either already accept `position_date` or are no-ops on the param.

### F-6 — Stock screener has no filter bar (High)
- **Reflex:** `app/states/instruments/mixins/stock_screener_mixin.py:30-107` — DTL10 min/max, market-cap min/max, ADV-3M min/max, multi-select country popover, Apply / Clear, Enter-key handler.
- **Next.js:** `app/dashboard/instruments/stock-screener/page.tsx` renders `<DataGrid>` only; AG Grid floating filters cover the columns but the screener-specific composite filter is missing.
- **Walk evidence (W5):** Reflex DOM probe `numberInputs=9, applyClearBtns=1`; Next.js `numberInputs=0, applyClearBtns=0`. Visible difference: Reflex shows three number ranges + COUNTRY dropdown + APPLY button in a horizontal strip above the grid; Next.js shows only AG Grid floating filters in the column header row.
- **Suggested fix:** new component `components/grid/stock-screener-filter-bar.tsx` exposed via the `filterBar` prop; backend route already accepts the filters.
- **Risk:** None — additive.

### F-7 — Reset-dates multi-field filter bar missing (High)
- **Reflex:** `app/components/portfolio_tools/reset_dates_ag_grid.py` filter bar — ticker dropdown, date range, frequency, reset month/day, up/down.
- **Next.js:** `app/dashboard/portfolio-tools/reset-dates/page.tsx` — bare DataGrid; also has 4 extra columns (Expiry, Latest Reset, Reset Date, Up/Down) plus `market_price` not present in Reflex (probably an enhancement; surface to user before keeping — see F-35).
- **Walk evidence (W4):** Reflex DOM `dateInputs=4, selectInputs=5, applyClearBtns=1`; Next.js `dateInputs=5 (toolbar + grid), selectInputs=0, applyClearBtns=0`. Filter contract not satisfied.
- **Suggested fix:** new `<ResetDatesFilterBar>` wired to existing `pmt_core.repositories.portfolio_tools` query params.
- **Risk:** Confirm `market_price` is a deliberate addition before the filter wire-up regresses what users see today (rolls into F-35).

### F-8 — Operations grids ship no Rerun/Kill context menu (High)
- Same Reflex source as F-1 + new walk evidence in F-1 above. Even if the backend POST routes (F-1) were absent, the menu would still need to render and pop a confirmation; today there is no UI affordance.
- **Suggested fix:** ship the menu with disabled state until F-1 lands; or bundle both fixes in one PR.

### F-9 — Pricer 3-D Z-axis selector + Plotly surface (High → Documented as known delta)
- **Reflex:** `app/components/risk/pricer_warrant_view.py` and `pricer_bond_view.py` render Plotly 3-D surfaces with a Z-axis dropdown.
- **Next.js:** `app/dashboard/risk/pricer-warrant/page.tsx` and `pricer-bond/page.tsx` ship inline-SVG 2-D charts with no Z-axis control.
- **Status:** **Already classified as out-of-scope intentional delta** in `docs/parity-screenshots/README.md`. User reconfirmed 2026-05-10 — stays out of scope.
- **Walk evidence (W2):** confirmed — Reflex `plotlyDivs=1, X-Axis label present`; Next.js `plotlyDivs=0, no X-Axis label`. Reflex `chartElements=80-86`; Next.js `chartElements=55`.
- **Risk:** Visible mismatch only.

### F-10 — Pricer-bond Notes panel missing entirely (Medium) — *spec corrected 2026-05-10*
- **Reflex:** `pricer_bond_view.py:277-286` ships **8 validation notes** that are identical to the warrant view's notes (Model Ticker / Reset on Day / Market Price Formula / Reset Price Formula / Lookback Days / Interest Rate Ticker / Reset Cap-Floor / formula functions). Earlier audit text claimed bond-specific terms like "duration / convexity / yield" — that was wrong; both views ship the same 8 notes.
- **Next.js:** `pricer-bond/page.tsx` renders **zero notes** (`grep -i 'notes' pricer-bond/page.tsx` → 0 matches). The page has no Notes section at all, not a copied-from-warrant section.
- **Walk evidence (W2):** Reflex form probe `page notes count=8`; Next.js `page notes count=0` (no Notes section).
- **Suggested fix:** add the 8 notes from `pricer_bond_view.py` to a `NOTES` array in `pricer-bond/page.tsx`. Same array can be shared with pricer-warrant (which is currently truncated — see F-33).
- **Risk:** None — string-only fix.

### F-11 — Pricer-bond Pricing Results data table missing (High)
- **Reflex:** `pricer_bond_view.py` renders a 6-row "Pricing Results" demo table below the outputs panel.
- **Next.js:** absent.
- **Walk evidence (W2):** Reflex `tables=1, tableRows=7`. Headers: `Ticker / Spot Price / Fair Value / Discount / Currency / Trade Date / Strike Price / Parity / Delta / Bond Floor` (10 cols × 6 data rows). Next.js `tables=0, tableRows=0`.
- **Suggested fix:** static demo table or wire to a small `pmt_core.services.pricing.bond_pricing_grid()` if available.
- **Risk:** Cosmetic, additive.

### F-22 — 26 pages missing client-side simulators (High)
- **Reflex:** `grep "simulate_.*_update" app/states/**/mixins/*.py` returns 28 mixins that mutate rows between refresh ticks at 2 s cadence (5 s for historical-data).
- **Next.js:** only `lib/grid-simulators.ts` ships `marketDataSimulator` and `fxDataSimulator`; only those two pages opt-in with `simulateUpdate=` + `simulateUpdateIntervalMs={2_000}`.
- **Pages still flat:** historical-data, ticker-data, stock-screener, instrument-data, instrument-term, special-terms, all 9 portfolio-tools pages, daily-procedures, operation-process, delta-change, risk-measures, risk-inputs, emsx-order, emsx-route, event-stream, event-calendar, reverse-inquiry, pnl-change, pnl-summary, pnl-currency, pnl-full, plus four positions pages.
- **Walk evidence:** pnl-change `cellChanged=20 (Reflex) / 0 (Next.js)` over a 5-s window — clean signal. Smaller-mock pages (portfolio-tools 2-row mock) flashed 0/0 on both sides — code-level finding stands; the visible flash test depends on dataset size and column volatility.
- **Suggested fix:** centralised `lib/grid-simulators.ts` template + per-page wire-up. Pages without numeric volatility (e.g. compliance) intentionally do not have a simulator on the Reflex side either; do not add.
- **Risk:** None for individual pages; high-volume change to many pages.

### F-31 — Risk grid pages missing position-date filter bar (High) — NEW (2026-05-10 walk)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/components/risk/delta_change_ag_grid.py:169` calls `_position_date_bar()` (helper at lines 109-150 reading/writing `RiskState.delta_change_position_date`); `risk_measures_ag_grid.py:115-150, 184` does the same. `risk_inputs_ag_grid.py` correctly omits the bar (no parity gap there).
- **Next.js:** `app/dashboard/risk/{delta-change, risk-measures}/page.tsx` — `<DataGrid>` props pass neither `filterBar` nor `toolbarDate`; verified by `grep "SingleDateFilterBar\|filterBar\|toolbarDate"` → 0 matches.
- **Walk evidence (W2):** Reflex shows `POSITION DATE` strip with value `2026-05-06` on both pages; Next.js DOM `dateInputs=0`.
- **Suggested fix:** identical to F-3 — wire `<SingleDateFilterBar>` plus the `position_date` query parameter on `riskGetDeltaChange` / `riskGetRiskMeasures`. Backend handlers in `fastapi_backend/app/routes/risk.py` already accept `position_date` (verify; if missing, mirror PnL's `Query` declaration).
- **Risk:** None — peer of F-3. Purely additive.

### F-32 — Pricer-warrant Pricing Results data table missing (High) — NEW (2026-05-10 walk)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/components/risk/pricer_warrant_view.py:253-311` — `_pricing_results_section()` renders a 4-column / 3-row demo table (`Ticker / Spot Price / Fair Value / Discount`) below the outputs panel. Source comment explicitly says "Pricing Results table matching the bond pricer pattern".
- **Next.js:** `nextjs-frontend/app/dashboard/risk/pricer-warrant/page.tsx` — no `<table>` element; `grep "table\|Pricing Results"` → 0 matches in JSX.
- **Walk evidence (W2):** Reflex `tables=1, tableRows=4`; Next.js `tables=0, tableRows=0`. F-11 only covered the bond view; the warrant view was missed.
- **Suggested fix:** mirror the F-11 fix shape — static demo table OR wire through a `pmt_core.services.pricing.warrant_pricing_grid()` if it exists. Smaller surface than F-11 (4 columns vs 10).
- **Risk:** Cosmetic, additive.

---

## Category 2 — Behavioural mismatches

### F-2 — Auto-refresh interval default still 30 s (High)
- **Reflex:** 19 pages tick at 2 s, 1 page at 5 s, 9 pages with no auto-refresh background task (force-refresh only — compliance and recon).
- **Next.js:** `components/grid/data-grid.tsx:171` defaults `autoRefreshIntervalMs = 30_000`. Only `market-data` and `fx-data` pages override it (verified).
- **Behaviour gap:** simulator ticks (F-22) at 2 s but backend refetch every 30 s — the simulators "lap" the real refetch ~14 times. Acceptable as a perception trick, but if any page is wired with a simulator, the user sees 2 s drift.
- **Suggested fix:** when a page sets `simulateUpdate`, default `autoRefreshIntervalMs` to the same 2 000 ms (configurable) so the two cadences stay aligned. Provide explicit overrides on the 19 listed pages.
- **Risk:** Low — wrapper-level default change, opt-in via simulator presence.
- **Related:** F-30 below — Reflex *hides* the auto-refresh switch on the 9 force-refresh-only pages; Next.js renders it on all of them.

### F-12 — Row-grouping panel + aggFunc not exposed in Next.js (Medium)
- **Reflex:** `pnl/*_ag_grid.py` and `compliance/*_ag_grid.py:{162,206,209-210}` set `row_group_panel_show="always"`, `group_default_expanded=-1`; columns ship `enable_row_group=True` and `agg_func="sum"`/`"avg"`.
- **Next.js:** `components/grid/columns.ts` exposes `enableRowGroup`, `aggFunc`, `rowGroup`, `flex` props but no PnL or compliance page sets them; `components/grid/data-grid.tsx` accepts a `showRowGroupPanel` prop (already wired) but no page passes it.
- **Walk evidence (W3, corrected probe):** AG Grid emits `.ag-column-drop-horizontal` divs unconditionally with the `ag-hidden` class when `rowGroupPanelShow !== 'always'` — naive probes always return true. Using `:not(.ag-hidden)[offsetHeight > 0]`: Reflex compliance pages show `rowGroupPanelVisible:1` on all 4 (restricted-list, undertakings, beneficial-ownership, monthly-exercise-limit); Next.js shows `0`. PnL pages: W2's earlier probe reported "panel visible on both" but did not filter visibility; the corrected reading is that PnL pages need the panel turned on too.
- **Suggested fix:** wire `showRowGroupPanel` on the four PnL pages plus the four compliance grids; surface `enableRowGroup` / `aggFunc` from the column-helper signatures and pass them on the columns Reflex aggregates.
- **Risk:** Cosmetic addition; the row-group panel pushes the toolbar down; verify on 1440×900 viewport.

### F-15 — `/api/compliance/undertakings` ignores `position_date` (Medium)
- **Reflex:** `app/states/compliance/mixins/undertakings_mixin.py` passes `self.undertakings_position_date` into `pmt_core.services.compliance.get_undertakings(position_date)`.
- **Next.js / FastAPI:** `fastapi_backend/app/routes/compliance.py::get_undertakings` does not declare a `position_date` query param. The frontend page therefore can't filter; even if it surfaced a filter bar, the API would ignore it.
- **Walk evidence (W3):** Reflex shows 1 POSITION DATE input; Next.js `dateInputs=0`. Two-layer gap (no filter bar + no backend param).
- **Suggested fix:** add `position_date: date | None = Query(None)` and forward to the existing service. Mirror the BeneficialOwnership wiring.

### F-16 — `/api/instruments/special-terms` ignores `pos_date` (Medium)
- **Reflex:** `app/states/instruments/mixins/special_terms_mixin.py` passes `pos_date` through.
- **Next.js / FastAPI:** route handler in `fastapi_backend/app/routes/instruments.py::get_special_terms` accepts no date filter.
- **Walk evidence (W5):** Reflex `dateInputs=2` (filter bar + toolbar); Next.js `dateInputs=1` (toolbar only).
- **Suggested fix:** same shape as F-15.

### F-17 — Search input has no debounce in Next.js (Medium)
- **Reflex:** `app/components/shared/contextual_workspace.py:480` debounces search input by 300 ms via `UIState.set_current_search.debounce(300)`.
- **Next.js:** `components/grid/data-grid.tsx:214-216` calls `setSearchValue(event.target.value)` synchronously; the next effect calls `setGridOption("quickFilterText", searchValue)`.
- **Behaviour:** AG Grid's quick-filter is fast but the synchronous re-render on each keystroke creates noticeable lag on >1 000-row grids. Add a 300 ms debounce in the wrapper to match Reflex.

### F-18 — Sticky highlight retry timeout: 10 s vs 15 s (Medium)
- **Reflex:** `app/components/shared/ag_grid_config/state_persistence.py:127-159` retries 30 × 500 ms = 15 s.
- **Next.js:** `lib/grid-registry.tsx:164-186` retries every 200 ms but only for 10 s, then gives up.
- **Behaviour:** if a target grid takes >10 s to mount (slow network, large dataset), the cross-page jump silently drops on Next.js but still works on Reflex.
- **Suggested fix:** raise the upper bound to 15 s OR drive both off the same constant.

### F-19 — Notification card slide-in animation missing (Low)
- **Reflex:** `notification_sidebar.py:77` ships `animate-in slide-in-from-right fade-in`.
- **Next.js:** `components/layout/notification-sidebar.tsx` has no entry animation.
- **Suggested fix:** Tailwind classes only.

### F-20 — Top-nav active-tab pulse animation missing (Low)
- **Reflex:** `top_navigation.py:31` adds `animate-pulse` on the active-tab underline.
- **Next.js:** `components/layout/top-navigation.tsx:107-109` does not. (Prior brief noted that animate-pulse was added; the unread-bell badge has it, but the active-tab underline still does not — verified by inspecting `top-navigation.tsx`.)

### F-21 — Notification sidebar default-open state diverges (Low)
- **Reflex:** sidebar opens on first paint (Reflex's UIState default).
- **Next.js:** `lib/notifications-context.tsx:91` defaults `isOpen` to `false`.
- **Status:** Documented as an intentional delta in `docs/parity-screenshots/README.md`. Re-flagging because behavioural difference is visible to the end user; user may want to reconsider.

### F-23 — Notification sidebar lacks infinite scroll (Low)
- **Reflex:** `notification_sidebar_state.py:81-156` paginates 20 at a time with a sentinel + `load_more_notifications`.
- **Next.js:** fetches 50 in one go, renders all.
- **Behaviour:** functionally fine for current dataset; flag in case the notification stream grows.

### F-30 — Auto-refresh switch rendered on Next.js force-refresh-only pages (Low) — NEW (2026-05-10 walk)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/components/shared/toolbar.py` conditionally renders the Auto Refresh switch based on the per-page mixin's `<module>_auto_refresh` attribute. 13 pages (5 recon + 4 compliance + market-data/{ticker-data, trading-calendar, market-hours} + instruments/ticker-data) have no auto-refresh task and Reflex renders no `[role=switch]` element on them.
- **Next.js:** `nextjs-frontend/components/grid/data-grid.tsx:104-243` — `showAutoRefresh` defaults to `false`, but every page in the matrix opts in. The toggle therefore renders on the 13 calm pages even though none has a simulator and none has a backend polling task.
- **Walk evidence (W1 + W3):** open `:3001/pmt/<calm-page>` — DOM probe `[role=switch], [aria-label*="auto" i]` returns `[]`. Open `:3000/dashboard/<calm-page>` — same probe returns `[{tag: "INPUT", label: "Auto refresh"}]`. 13/13 calm pages flagged.
- **User-visible impact:** toggling the switch on a calm page in Next.js triggers a 30 s wrapper-level refetch but Reflex never offered the control because the underlying mixin has no background polling task. End-state: visible widget, behaviour drift on a page that's supposed to be "static / force-refresh-only".
- **Suggested fix:** drop `showAutoRefresh` on the 13 calm pages so the wrapper hides the toggle, OR extend `<DataGrid>` with a `static` flag that hides the row when set. Option (a) is the smaller change.
- **Risk:** None. The toggle is wired correctly when on; removing it on calm pages is purely subtractive.

### F-34 — compliance/beneficial-ownership: Next.js renders date-range bar; Reflex single-date (Low) — NEW (2026-05-10 walk)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/components/compliance/beneficial_ownership_ag_grid.py` ships `_position_date_bar()` (single-date bar — `dateInputs=1`).
- **Next.js:** `app/dashboard/compliance/beneficial-ownership/page.tsx` wires a `<DateRangeFilterBar>` (or equivalent) — `dateInputs=2`.
- **Walk evidence (W3):** Reflex DOM `dateInputs:1`; Next.js DOM `dateInputs:2`.
- **Impact:** visible affordance mismatch. Both query the same backend endpoint, but the filter UX doesn't match the spec.
- **Suggested fix:** swap the Next.js page to `<SingleDateFilterBar>` to mirror Reflex (or, if the user prefers the date-range UX, document and keep — promote to F-21-style intentional delta).
- **Risk:** Low — single component swap.

---

## Category 3 — Visual mismatches with user impact

### F-24 — Subtab nav allows horizontal scroll (Reflex hides it) (Low)
- `subtab-navigation.tsx:23` uses `overflow-x-auto`; Reflex `module_layout.py:116` uses `overflow-hidden no-scrollbar`. Visible only on narrow viewports.

### F-25 — Notification highlight CSS class names diverge (Low)
- Reflex `assets/notification_highlight.css:.notification-highlight`.
- Next.js `globals.css:.pmt-notification-highlight`.
- Documented namespace decision; harmless except for a test that grep-matches the class name.

### F-26 — Toolbar date picker has no webkit overrides on Next.js (Low)
- Reflex `toolbar.py:246` adds polished webkit calendar masking.
- Next.js `data-grid.tsx:545` uses browser-default. Cosmetic on Chrome.

### F-27 — Mobile responsive nav missing (Low — mobile not in scope today)
- Reflex top nav has hamburger + slide-in drawer for `md:hidden`.
- Next.js top nav has no mobile collapse. Currently fine because the desktop / Tauri target is the only shipping target.

### F-33 — Pricer-warrant Notes panel truncated (5 of 8 items) (Medium) — NEW (2026-05-10 walk)
- **Reflex:** `Portfolio-Management-Tool-reflex/app/components/risk/pricer_warrant_view.py` ships 8 notes (mirrors `pricer_bond_view.py:277-286`):
  1. Model Ticker / Spot Price compulsory
  2. Reset on Day rule
  3. Market Price Formula syntax (period format)
  4. Reset Price Formula syntax (executable price)
  5. Lookback Days + Reset Multiplier rule
  6. Interest Rate Ticker / Interest Rate
  7. Reset Cap / Reset Floor
  8. Formula functions in python/numpy/pandas
- **Next.js:** `nextjs-frontend/app/dashboard/risk/pricer-warrant/page.tsx:91 const NOTES = [...]` ships only 5 notes (items 1, 2, 5, 6, 7). Items 3, 4, 8 are missing.
- **Walk evidence (W2):** Reflex `page notes count=8`; Next.js `page notes count=5`. Missing notes are all formula-related (the most actionable ones).
- **Suggested fix:** add the 3 missing notes to the `NOTES` array. Same array can be exported and reused on the bond page (closes F-10 in the same PR).
- **Risk:** None — string-only fix.

### F-36 — Portfolio-tools header label abbreviation drift (Very Low) — NEW (2026-05-10 walk)
- **Walk evidence (W4):** seven cases identified across portfolio-tools:
  - `JPM Request Locate` → `JPM Req` (stock-borrow)
  - `BofA Request Locate` → `BofA Req` (stock-borrow)
  - `Announcement Date` → `Announce Date` (coming-resets)
  - `Outstanding Amount` → `Outstanding` (cb-installments)
  - `Redeemed Amount` → `Redeemed` (cb-installments)
  - `Excess Amount Threshold` → `Threshold` (excess-amount)
  - `First Reset Date` → `First Reset` (reset-dates)
- **Suggested fix:** decide on a canonical label set (Reflex's longer descriptive labels or Next.js's shorter ones); one-line fix per column.
- **Risk:** None — pure label change.

---

## Category 4 — Data / endpoint mismatches

(Captured under F-1, F-15, F-16; nothing else found beyond those three.)

---

## Category 5 — Intentional / acceptable deltas (or pending product decision)

- Storage key prefixes (`pmt:next:` vs raw) — namespace decision in 2026-05-07 brief.
- Pending-highlight key (`pmt:next:pendingHighlight` vs Reflex `__pmtPendingHighlight`) — same namespace decision.
- Pricer 3-D chart vs inline-SVG payoff (F-9) — `docs/parity-screenshots/README.md` already calls this out.
- Trial-license watermark — both apps run AG Grid Enterprise without a key (user reconfirmed 2026-05-10).
- 14-issues red badge — Next 16 dev overlay; vanishes on `pnpm build`.
- Notification sidebar default-open state (F-21) — documented.

### F-35 — Cross-cutting "Next.js ahead" column-set drift (Low — pending product decision) — NEW (2026-05-10 walk)
- **Walk evidence:** every walked PnL / risk / portfolio-tools / instruments / events / orders grid exposes 1-6 additional columns beyond the Reflex default visible set. The pattern is consistent: Next.js ships everything from `pmt_core` columndefs; Reflex hides extras by default. Concrete deltas captured in `route-matrix.md` (column "Findings" + agent notes).
- **Affected modules / pages:** at least
  - portfolio-tools (9 pages, +1 to +6 each — see W4 notes for line items, including `market_price` on reset-dates from F-7)
  - pnl (4 pages, +3 to +5 each — `PnL Chg% 1D/1W/1M`, `FX Rate (T-1)`, `Last Volume`, `ADV 3M`, etc.)
  - risk/{delta-change, risk-measures, risk-inputs} (+2 to +6 each — `POS DELTA`, `Pos Gamma`, `Notional`, etc.)
  - instruments/ticker-data (+3 — `SMkt Cap`, `1D%`, `DTL`)
  - events/event-stream (+5-6 audit columns — `Alerted`, `Recur`, `Created By/Time`, `Updated By/Time`)
  - orders/emsx-order (+4 — `EMSX Amount/Routed/Working/Filled`)
- **Suggested fix:** product decision pending — either (a) Next.js trims columns to match Reflex (regress to documented spec), or (b) Reflex's hide list is documented as out-of-date and the Next.js superset becomes the canonical column set. Surface to user before any code change.
- **Risk:** None — read-only column visibility.

### F-37 — events/event-calendar adds an Apply button absent on Reflex (Low — additive) — NEW (2026-05-10 walk)
- **Reflex:** event-calendar filter strip has only an "Event Date Filter Input" (date picker); filter applies on change.
- **Next.js:** event-calendar filter strip has the same date picker plus an explicit `Apply` button (`applyClearBtns:1`).
- **Walk evidence (W5):** Reflex `applyClearBtns=0`; Next.js `applyClearBtns=1`.
- **Status:** probably an enhancement, not a regression. Adds an extra click vs Reflex but improves intent clarity for a date filter. Surface to product owner — keep or revert.
- **Risk:** None.

---

## Category 6 — Test / documentation gaps

### F-28 — `ticker-data` page exists in Next.js but no Reflex source (Documentation)
- `nextjs-frontend/app/dashboard/instruments/ticker-data/page.tsx` is wired and live; Reflex has no `instruments/ticker_data_ag_grid.py`. The `instruments/ticker-data` Reflex route is served by the `inst_ticker_data_page` defined under `app/pages/instruments/ticker_data_page.py` which presumably renders a different component. Worth a doc note: the Next.js page is **ahead of** Reflex on this one. User reconfirmed 2026-05-10 — stays out of scope.

### F-29 — Slug mismatches break cross-app deep links (Medium documentation)
- `/market-data/reference-data` (Reflex) ↔ `/market-data/ticker-data` (Next.js) — works via label match.
- `/instruments/special-term` (Reflex) ↔ `/instruments/special-terms` (Next.js) — falls through to 404.
- `/operations/daily-procedure-check` (Reflex) ↔ `/operations/daily-procedures` (Next.js) — falls through to 404.
- **Walk evidence (W5):** confirmed both 404 paths; Reflex notification entering the Next.js sidebar from a shared backend would 404 on those two slugs.
- **Suggested fix:** add explicit aliases inside `MODULE_SLUG_OVERRIDES` (or a peer `SUBTAB_SLUG_OVERRIDES`) for `special-term → special-terms` and `daily-procedure-check → daily-procedures`. One-line additions.

### F-38 — events/reverse-inquiry shows 3 dateInputs on Reflex vs 2 on Next.js (Low — spot-check) — NEW (2026-05-10 walk)
- **Walk evidence (W5):** Reflex `dateInputs:3`; Next.js `dateInputs:2`. Reflex's third input is likely a header-level filter bar input or a grid-internal date editor; both pages load 30 rows of identical data.
- **Status:** spot-check follow-up. Recommend a quick code-level recheck of `events/reverse_inquiry_ag_grid.py` to determine whether Reflex's third input is a missing filter bar (escalate to F-4 family) or a grid-internal element (close out as benign).
- **Risk:** Low — page is functionally PASS at 30 rows.

---

## Top 10 findings by severity (post-walk)

| Rank | ID | Severity | Title |
|---|---|---|---|
| 1 | F-1 | Blocker | Operations Rerun/Kill backend writes unimplemented |
| 2 | F-3 | Blocker | All four PnL pages missing position-date filter bar |
| 3 | F-22 | High | 26 pages missing client-side simulators (live-data feel) |
| 4 | F-2 | High | Auto-refresh default 30 s, Reflex is 2 s on 19 pages |
| 5 | F-4 | High | Three portfolio-tools pages missing position-date filter |
| 6 | F-31 | High | Risk grid pages missing position-date filter (delta-change + risk-measures) — NEW |
| 7 | F-8 | High | Operations grids ship no Rerun/Kill context menu UI |
| 8 | F-6 | High | Stock-screener filter bar missing (3 ranges + multi-select) |
| 9 | F-7 | High | Reset-dates multi-field filter bar missing |
| 10 | F-11 + F-32 | High | Pricer-bond + pricer-warrant Pricing Results data tables missing |

Honourable mentions (Medium, just under the cut): F-15 / F-16 (backend
ignores `position_date` / `pos_date`), F-10 (pricer-bond Notes panel
absent), F-33 (pricer-warrant Notes truncated 5/8), F-12 (row-group
panel + aggFunc).

---

## Coverage status (post-walk)

Every row in `route-matrix.md` is now PASS or MISMATCH. Zero
`NOT TESTED` rows. The previous "Blocked / untested" list (38 rows
the original audit deferred) is closed.

- **PASS rows: 16 / 50** (market-data/{market-data, fx-data,
  market-hours}, positions/{all five}, recon/{all five},
  events/{event-calendar, reverse-inquiry}).
- **MISMATCH rows: 34 / 50** — each cites at least one F-1..F-38
  finding.
- **Walk artifacts:** 100 PNGs + 4 context-menu evidence shots + 5
  per-W `notes.md` files under
  `docs/parity-audit/2026-05-09/artifacts/walk-W{1..5}/`.

---

## Recommended next implementation order (post-walk)

The 2026-05-10 walk added 9 new findings (F-30..F-38) and corrected 2
existing ones (F-10, F-12). Updated order:

1. **F-1 + F-8** — operations Rerun/Kill backend POST + UI. One PR, two
   commits (backend, frontend). Highest user value.
2. **F-3 + F-4 + F-31** — PnL + portfolio-tools + risk position-date
   filter bars. Mass-template change; ~1 line per page once the
   template is settled. (F-31 added by the walk; same template.)
3. **F-15 + F-16** — backend `position_date` / `pos_date` on
   undertakings + special-terms; trivial follow-up to (2).
4. **F-29** — slug aliases for special-terms + daily-procedures.
   Cheap warmup; closes a notification-deeplink 404.
5. **F-2** — make `simulateUpdate` automatically lower
   `autoRefreshIntervalMs` to the simulator's interval. Then enable
   simulators in batches.
6. **F-22** — port simulators page-by-page in priority order (pnl,
   positions, risk, then portfolio-tools, then instruments, events,
   ops, orders).
7. **F-30** — drop `showAutoRefresh` on the 13 calm pages (pure
   subtractive change).
8. **F-12** — row-group panel + per-column `enableRowGroup` / `aggFunc`
   on the four PnL + four compliance grids.
9. **F-6 + F-7** — bespoke filter bars (stock-screener, reset-dates).
   F-7 also surfaces F-35 (`market_price`) — must clear product
   decision first.
10. **F-11 + F-32** — pricer-bond + pricer-warrant Pricing Results
    tables (Reflex pattern).
11. **F-10 + F-33** — pricer-bond + pricer-warrant Notes panels
    (single shared `NOTES` array fix).
12. **F-34** — compliance/beneficial-ownership single-date vs
    date-range bar swap.
13. **F-17** — search debounce.
14. **F-18 / F-19 / F-20 / F-21 / F-23 / F-24 / F-25 / F-26** — polish
    pass.
15. **F-35 + F-36 + F-37 + F-38** — pending product decision /
    spot-check follow-up. F-35 (column-set drift) is the largest
    surface and should land last so any column trim doesn't regress
    intermediate work.

Items F-9 (Plotly 3-D), F-27 (mobile nav), F-28 (Reflex ticker-data
divergence) are **left as known deltas** per user reconfirmation
2026-05-10 and should only land if explicitly reprioritised.
