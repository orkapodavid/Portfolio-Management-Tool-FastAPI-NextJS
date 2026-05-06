# Walk W2 notes — pnl + risk (9 routes, 7 grids + 2 forms)

## Verified at start
- Backend health: `{"status":"ok","runtime":"server","database_backend":"sqlite"}` (HTTP 200)
- HEAD: 5f1c7b9
- Both browser sessions resized to 1440×900 before any navigation.
- Cell-flash watch for grid pages used 1-second polling for 6-8 s after a 2-s page settle.

## Per-route results

### Row 12 — pnl/pnl-change (grid)
- **Status:** MISMATCH (expected per F-3, F-12, F-2/F-22)
- **Reflex DOM:** `headers=["","","Trade Date","Underlying","Ticker","PnL YTD","PnL Chg 1D","PnL Chg 1W","PnL Chg 1M"], rows=14, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], compactBtn=true, autoRefresh=true, statusBar=true, groupPanel=true, groupPanelText="Drag here to set row groups", cellChanged=20 (after 5 s)`
- **Next.js DOM:** `headers=["","Ticker","","Trade Date","Underlying","PnL YTD","PnL Chg 1D","PnL Chg 1W","PnL Chg 1M","PnL Chg% 1D","PnL Chg% 1W","PnL Chg% 1M"], rows=14, dateInputs=[{val:"",par:"ag-wrapper ag-input-wrapper ag-text-field-input-wrapper",label:""}], compactBtn=true, autoRefresh=true, statusBar=true, groupPanel=true, groupPanelText="Drag here to set row groups", cellChanged=0 (after 5 s)`
- **Existing findings confirmed:**
  - **F-3** confirmed — Reflex has a labelled `POSITION DATE` input (in a flex container with className `flex items-center gap-2`); Next.js's only `input[type="date"]` is the AG Grid floating filter for `Trade Date`, not a position-date filter bar.
  - **F-2 / F-22** confirmed — 20 cells flashing on Reflex over a 5-s window vs 0 on Next.js, matching the simulator-vs-no-simulator + 30-s vs 2-s cadence story.
  - **F-12** is partially refuted: both sides expose AG Grid's row-group panel ("Drag here to set row groups"). The chrome rail is identical; what's missing is per-column `enableRowGroup`/`aggFunc` on Next.js, which the bare DOM probe can't tell from the panel state. F-12 stands as documented (column-level enablement gap).
  - **F-5 (rowIdKey)** is a code-level finding only and not visible in the DOM probe.
- **New findings:** `Next.js exposes 3 extra columns ("PnL Chg% 1D/1W/1M") that the Reflex page hides`. Could be intentional polish on Next.js (extra info) — flagging for awareness only, not a regression.
- **Notes:** Notification-jump deep-link probe was deferred — `pnl_change_grid` is the documented target but the row-jump UX has its own dedicated regression in W1 evidence. Sort-by-header click via `eval` did not trigger AG Grid's sort handler (eval clicks bypass the cell click pipeline); not a finding, just a probe limitation.

### Row 13 — pnl/pnl-summary (grid)
- **Status:** MISMATCH (expected per F-3, F-12)
- **Reflex DOM:** `headers=["","","Trade Date","Underlying","Currency","Price","Price (T-1)","Price Change","FX Rate"], rows=12, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], statusBar=true, groupPanel=true, cellChanged=0 (8-s watch)`
- **Next.js DOM:** `headers=["","Underlying","","Trade Date","Currency","Price","Price (T-1)","Price Change","FX Rate","FX Rate (T-1)","FX Rate Change","DTL","Last Volume","ADV 3M"], rows=12, dateInputs=[{ag-wrapper}], statusBar=true, groupPanel=true, cellChanged=0 (8-s watch)`
- **Existing findings confirmed:** F-3 (POSITION DATE label only on Reflex), F-12 (col-level), F-5 (code-level)
- **New findings:** Next.js exposes 5 additional columns (FX Rate (T-1), FX Rate Change, DTL, Last Volume, ADV 3M) not visible on Reflex's default layout. Same "extra info" pattern as pnl-change.
- **Notes:** Neither side flashed cells in this 8-s window; pnl-summary mixin appears not to ship a simulator on Reflex either, so the F-2/F-22 effect is invisible here. F-22 still applies at the code level.

### Row 14 — pnl/pnl-currency (grid)
- **Status:** MISMATCH (expected per F-3, F-12, F-2/F-22)
- **Reflex DOM:** `headers=["","","Trade Date","Currency","FX Rate","FX Rate (T-1)","FX Rate Change","CCY Exposure","USD Exposure"], rows=10, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], statusBar=true, groupPanel=true, cellChanged=3`
- **Next.js DOM:** `headers=["","Currency","","Trade Date","FX Rate","FX Rate (T-1)","FX Rate Change","CCY Exposure","USD Exposure","POS CCY Expo","CCY Hedged PnL","POS CCY PnL","Net CC","POS C (truncated)"], rows=10, dateInputs=[{ag-wrapper}], statusBar=true, groupPanel=true, cellChanged=0`
- **Existing findings confirmed:** F-3, F-2/F-22 (3 vs 0 cells flashing), F-12 (col-level), F-5 (code-level)
- **New findings:** Next.js exposes 5 additional columns (POS CCY Expo, CCY Hedged PnL, POS CCY PnL, Net CC, "POS C…" truncated). Same pattern.
- **Notes:** Reflex pnl-currency does flash; F-2/F-22 cleanly demonstrated.

### Row 15 — pnl/pnl-full (grid)
- **Status:** MISMATCH (expected per F-3, F-12, F-2/F-22)
- **Reflex DOM:** `headers=["","","Trade Date","Underlying","Ticker","PnL YTD","PnL Chg 1D","PnL Chg 1W","PnL Chg 1M"], rows=30, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], statusBar=true, groupPanel=true, cellChanged=4`
- **Next.js DOM:** `headers=["","Ticker","","Trade Date","Underlying","PnL YTD","PnL Chg 1D","PnL Chg 1W","PnL Chg 1M","PnL Chg% 1D","PnL Chg% 1W","PnL Chg% 1M"], rows=30, dateInputs=[{ag-wrapper}], statusBar=true, groupPanel=true, cellChanged=0`
- **Existing findings confirmed:** F-3, F-2/F-22 (4 vs 0), F-12 (col-level), F-5 (code-level)
- **New findings:** Same +3 percentage-change columns as pnl-change.
- **Notes:** —

### Row 16 — risk/delta-change (grid)
- **Status:** MISMATCH (expected per F-2/F-22; **also surfaces a NEW gap not covered by F-3/F-4**)
- **Reflex DOM:** `headers=["","","Ticker","Company Name","Structure","Currency","FX Rate","Current Price","Valuation Price"], rows=10, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], statusBar=true, groupPanel=true, cellChanged=0`
- **Next.js DOM:** `headers=["","Ticker","","Company Name","Structure","Currency","FX Rate","Current Price","Valuation Price","POS DELTA","Pos Gamma"], rows=10, dateInputs=[] (zero), statusBar=true, groupPanel=true, cellChanged=0`
- **Existing findings confirmed:** F-2/F-22 (code-level — both flat in window but Reflex has the `delta_change_mixin` 2-s cadence), F-5 (code-level)
- **New findings (W2-A):** Next.js delta-change has **no position-date filter bar AND no toolbar date picker** — Reflex `app/components/risk/delta_change_ag_grid.py:169` calls `_position_date_bar()`, but `nextjs-frontend/app/dashboard/risk/delta-change/page.tsx` neither passes `filterBar` nor `toolbarDate`. F-3 explicitly limits its scope to PnL pages; F-4 is for portfolio-tools. Risk pages with `_position_date_bar()` (delta-change + risk-measures) are **not** in F-3/F-4 today.
- **Notes:** Next.js exposes 2 extra columns (POS DELTA, Pos Gamma) that aren't visible on Reflex's default layout.

### Row 17 — risk/risk-measures (grid)
- **Status:** MISMATCH (expected per F-2/F-22; **same NEW gap as W2-A**)
- **Reflex DOM:** `headers=["","","Ticker","Seed","Simulation#","Trial#","Underlying","Sec Type","Is Private"], rows=20, dateInputs=[{val:"2026-05-06",label:"POSITION DATE"}], statusBar=true, groupPanel=true, cellChanged=0`
- **Next.js DOM:** `headers=["","Ticker","","Seed","Simulation#","Trial#","Underlying","Sec Type","Is Private","Notional","Notional Used","Notional Current","Currency","FX Rate","Spot Price"], rows=20, dateInputs=[] (zero), statusBar=true, groupPanel=true, cellChanged=0`
- **Existing findings confirmed:** F-2/F-22 (code-level), F-5 (code-level)
- **New findings (W2-A continued):** Reflex `risk_measures_ag_grid.py:184` ships `_position_date_bar()`; Next.js page has neither `filterBar` nor `toolbarDate`. Same gap as delta-change.
- **Notes:** Next.js exposes 6 extra columns; same "extra info" pattern.

### Row 18 — risk/risk-inputs (grid)
- **Status:** PASS on filter-bar dimension (intentional: Reflex risk-inputs has no position-date bar either); MISMATCH on data shape and (code-level) F-2/F-22
- **Reflex DOM:** `headers=["","","Ticker","Seed","Simulation#","Trial#","Underlying","Sec Type","Is Private"], rows=2, dateInputs=[] (zero), statusBar=true, groupPanel=true, cellChanged=0`
- **Next.js DOM:** `headers=["","Ticker","","Seed","Simulation#","Trial#","Underlying","Sec Type","Is Private","Notional","Notional Used","Notional Current","Currency","FX Rate","Spot Price"], rows=24, dateInputs=[] (zero), statusBar=true, groupPanel=true, cellChanged=0`
- **Existing findings confirmed:** F-2/F-22 (code-level), F-5 (code-level)
- **New findings:** —. Verified Reflex `risk_inputs_ag_grid.py` does **not** import `_position_date_bar()`; both sides correctly omit the bar.
- **Notes:** Row count differs (Reflex 2 vs Next.js 24) — that's a data-fixture difference (Reflex mock is sparser), not a UI gap. Next.js exposes 6 extra columns.

### Row 19 — risk/pricer-warrant (form)
- **Status:** MISMATCH (expected, F-9 documented delta; **also surfaces NEW gaps W2-B and W2-C**)
- **Reflex form:** `inputCount=22, labelCount=30, plotlyDivs=1, tables=1, tableRows=4, chartElements=80, labels include both "X-Axis" and "Y-Axis", page notes count=8`
  - Pricing Results table headers: `["Ticker","Spot Price","Fair Value","Discount"]`; first row `["7777 JP Warrant","498.00","15.50","+3.11%"]`; 3 data rows.
  - 8 page notes: Model Ticker, Reset on Day, Market Price Formula, Reset Price Formula, Lookback Days, Interest Rate Ticker, Reset Cap/Floor, formula functions in python/numpy/pandas.
- **Next.js form:** `inputCount=30, labelCount=30, plotlyDivs=0, tables=0, tableRows=0, chartElements=55, labels include only "Y-Axis" (no "X-Axis"), page notes count=5`
  - 5 page notes (subset of Reflex): Model Ticker, Reset on Day, Lookback Days, Interest Rate Ticker, Reset Cap/Floor. Missing 3: Market Price Formula, Reset Price Formula, formula functions.
- **Existing findings confirmed:**
  - **F-9** confirmed — Reflex has 1 Plotly div + an X-Axis selector; Next.js has 0 plotly + only Y-Axis. Documented intentional delta.
- **New findings:**
  - **W2-B (NEW):** Pricer-warrant Pricing Results data table is **missing on Next.js**. Reflex `pricer_warrant_view.py:253-311` ships `_pricing_results_section()` (4-col / 3-row demo table — Ticker / Spot Price / Fair Value / Discount). Next.js `app/dashboard/risk/pricer-warrant/page.tsx` has no equivalent (`grep "table\|Pricing Results"` → no matches). F-11 only covers pricer-bond's table; pricer-warrant's table is not flagged anywhere.
  - **W2-C (NEW):** Pricer-warrant Notes panel is **truncated to 5 of 8 items on Next.js**. Reflex `pricer_warrant_view.py` (mirrors `pricer_bond_view.py:_notes_section`) ships 8 notes; Next.js `pricer-warrant/page.tsx:91 const NOTES = [...]` ships only 5. The 3 dropped notes are non-trivial (Market Price Formula syntax, Reset Price Formula syntax, formula function library reference).
- **Notes:** Chart present on both but Reflex is 3-D Plotly with X-Axis selector, Next.js is inline-SVG payoff curve with only Y-Axis (intentional per F-9). The X-Axis selector loss is part of the F-9 envelope, not a separate finding.

### Row 20 — risk/pricer-bond (form)
- **Status:** MISMATCH (expected, F-9 + F-11 + F-10)
- **Reflex form:** `inputCount=27, labelCount=30, plotlyDivs=1, tables=1, tableRows=7, chartElements=86, page notes count=8`
  - Pricing Results table headers: `["Ticker","Spot Price","Fair Value","Discount","Currency","Trade Date","Strike Price","Parity","Delta","Bond Floor"]`; first row `["7777 JP CB","¥506.000","¥101.020","0.00%","JPY","2026-02-11","¥506.000","¥100.000","0.14","¥97.508"]`; 6 data rows.
  - 8 page notes: identical to pricer-warrant (Model Ticker, Reset on Day, Market Price Formula, Reset Price Formula, Lookback Days, Interest Rate Ticker, Reset Cap/Floor, formula functions).
- **Next.js form:** `inputCount=40, labelCount=30, plotlyDivs=0, tables=0, tableRows=0, chartElements=55, page notes count=0 (no Notes section at all)`
- **Existing findings confirmed:**
  - **F-9** confirmed — same 3-D vs SVG split. Documented intentional delta.
  - **F-11** confirmed — Reflex bond Pricing Results table is 6 rows × 10 cols (Ticker, Spot Price, Fair Value, Discount, Currency, Trade Date, Strike Price, Parity, Delta, Bond Floor); Next.js has no `<table>` element on the page.
  - **F-10** confirmed BUT spec wording is INCORRECT: F-10 says Reflex bond ships "8 bond-specific validation notes" with words like "duration", "convexity", "yield". The live Reflex bond page (and `pricer_bond_view.py:277-286`) ships 8 notes that are **identical** to the warrant notes (same Model Ticker / Reset / formula text); they are NOT bond-specific. The actual gap on Next.js is even worse than F-10 states: Next.js `pricer-bond/page.tsx` has **NO Notes section at all** (`grep notes\|Notes` → 0 matches). Suggested correction to F-10: "Pricer-bond Notes panel missing entirely on Next.js (Reflex ships 8 validation notes; Next.js has zero)."
- **New findings:** —
- **Notes:** F-10's bond-specific-content claim is wrong; the practical gap is correctly captured as "Next.js bond is missing the Notes section". Filing this under "F-10 spec correction" rather than a fresh finding ID.

## Proposed new findings (W2-A..W2-C)

### W2-A — Risk grid pages (delta-change + risk-measures) missing position-date filter bar
- **Severity:** High (mirrors F-3 in spirit; risk grids are a peer of the PnL grids)
- **Category:** 1 — True missing features
- **Reflex source:**
  - `Portfolio-Management-Tool-reflex/app/components/risk/delta_change_ag_grid.py:169` calls `_position_date_bar()` (helper at lines 109-150 reading/writing `RiskState.delta_change_position_date`).
  - `Portfolio-Management-Tool-reflex/app/components/risk/risk_measures_ag_grid.py:115-150, 184` — same helper + invocation.
  - `risk_inputs_ag_grid.py` correctly omits the bar; not in scope here.
- **Next.js source:**
  - `nextjs-frontend/app/dashboard/risk/delta-change/page.tsx` — `<DataGrid>` props do not pass `filterBar` or `toolbarDate`; verified by `grep "SingleDateFilterBar\|filterBar\|toolbarDate"` → 0 matches.
  - `nextjs-frontend/app/dashboard/risk/risk-measures/page.tsx` — same shape; 0 matches.
- **Browser repro:** open `:3000/dashboard/risk/delta-change` and `:3000/dashboard/risk/risk-measures` — neither shows a `POSITION DATE` strip; the `dateInputs` count is 0 on the DOM probe. Reflex's `:3001/pmt/risk/{delta-change,risk-measures}` shows the strip, populated with `2026-05-06`.
- **Suggested fix:** identical pattern to the F-3 fix — wire `<SingleDateFilterBar>` plus the existing `position_date` query parameter on `riskGetDeltaChange` / `riskGetRiskMeasures`. Backend already accepts `position_date` (`fastapi_backend/app/routes/risk.py` — verify the handler signature; if missing, mirror PnL's `Query` declaration).
- **Risk:** None — purely additive on the page; no shared chrome change.

### W2-B — Pricer-warrant Pricing Results data table missing on Next.js
- **Severity:** High (peer of F-11 for the warrant view)
- **Category:** 1 — True missing features
- **Reflex source:**
  - `Portfolio-Management-Tool-reflex/app/components/risk/pricer_warrant_view.py:253-311` — `_pricing_results_section()` renders a 4-column / 3-row demo table (Ticker / Spot Price / Fair Value / Discount) below the outputs panel.
  - Comment in source explicitly says "Pricing Results table matching the bond pricer pattern" (line 253).
- **Next.js source:**
  - `nextjs-frontend/app/dashboard/risk/pricer-warrant/page.tsx` — no `<table>` element; `grep "table\|Pricing Results"` → 0 matches in JSX (one match is irrelevant in OutputMetric label).
- **Browser repro:** `:3001/pmt/risk/pricer-warrant` shows the Pricing Results card with header row `Ticker / Spot Price / Fair Value / Discount` and 3 data rows. `:3000/dashboard/risk/pricer-warrant` shows nothing in that location.
- **Suggested fix:** same as F-11's bond fix — drop in a static demo table OR wire through `pmt_core.services.pricing.warrant_pricing_grid()` if it exists. Mirror F-11's fix shape; the warrant table has only 4 columns vs the bond's 10, so it's a smaller surface.
- **Risk:** Cosmetic; additive.

### W2-C — Pricer-warrant Notes panel truncated (5 of 8 items)
- **Severity:** Medium (peer of F-10 for the warrant view; the actual spec issue here is a content fix)
- **Category:** 3 — Visual mismatches with user impact
- **Reflex source:** `Portfolio-Management-Tool-reflex/app/components/risk/pricer_warrant_view.py` ships 8 notes (mirrors `pricer_bond_view.py:277-286`):
  1. Model Ticker / Spot Price compulsory
  2. Reset on Day rule
  3. Market Price Formula syntax (period format)
  4. Reset Price Formula syntax (executable price)
  5. Lookback Days + Reset Multiplier rule
  6. Interest Rate Ticker / Interest Rate
  7. Reset Cap / Reset Floor
  8. Formula functions in python/numpy/pandas
- **Next.js source:** `nextjs-frontend/app/dashboard/risk/pricer-warrant/page.tsx:91 const NOTES = [...]` ships only 5 notes (items 1, 2, 5, 6, 7). Items 3, 4, 8 are missing.
- **Browser repro:** count `<p>` items inside the amber-bordered Notes panel on both pages — Reflex shows 8, Next.js shows 5.
- **Suggested fix:** add the 3 missing notes to the `NOTES` array in `pricer-warrant/page.tsx`. One-line additions per note. Also covers F-10 by making the bond page mirror this same array (or by porting the bond's missing Notes section entirely).
- **Risk:** None — string-only fix.

### F-10 spec correction (not a new finding, but a note for next maintainer)
- F-10 currently asserts "Reflex bond ships 8 bond-specific validation notes" with terms like duration / convexity / yield. **This is wrong** — `pricer_bond_view.py:277-286` ships exactly the same 8 warrant notes (Model Ticker / Reset / formula). The real gap on Next.js bond is much larger: there is no Notes section at all (`grep "notes\|Notes"` → 0 matches in `pricer-bond/page.tsx`). Suggest rewording F-10 to "Pricer-bond Notes panel missing entirely on Next.js (Reflex ships 8 warrant-style notes; Next.js renders none)."

## Summary
- Routes processed: 9 (7 grids + 2 forms)
- PASS: 0 / MISMATCH: 9 (every route diverges; expected — each carries at least one F-1..F-29 finding plus the new W2-A/B/C surfaces)
- New findings: 3 (W2-A, W2-B, W2-C) + 1 spec correction (F-10 wording)
- Existing findings hit: F-2, F-3, F-5 (code-level), F-9, F-10, F-11, F-12 (col-level only — chrome rail is parity), F-22
- Cross-cutting Next.js extra-columns observation: 5 of the 7 grid pages expose 2-6 additional columns vs Reflex's default visible set. Pattern is consistent (Next.js shows everything; Reflex hides extras by default). Could be a deliberate enrichment or a missing-`hide=true` carryover from the audit. Flagging for awareness only — not raising a new finding because the data-shape vs visibility is ambiguous without product input.
