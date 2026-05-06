# Walk W1 notes — market-data + positions (11 routes)

## Verified at start
- Backend health: `{"status":"ok","runtime":"server","database_backend":"sqlite"}`
- Next.js: 200
- Reflex: 200
- HEAD: 5f1c7b9 (per brief)

## Methodology notes

`playwright-cli eval` does not accept `--js`; the actual usage is
`playwright-cli -s=<session> eval '<func>'` (positional).

The DOM probe in the brief returned only the headers visible inside the
viewport because AG Grid uses **column virtualization** — pinned-left
columns plus what fits inside `.ag-center-cols-viewport`. To get full
column parity I scrolled `.ag-center-cols-viewport` left → right in
~1/3-viewport increments, dedup-collected `[col-id]` + the header text
into a `Map`, and reset `scrollLeft = 0` at the end. Reflex grids look
identical to Next.js grids once virtualization is unwound.

The original probe also under-reports `dateInputs` against Reflex
because Reflex's per-page **position-date** strip is rendered as
`<input type="text">` with a calendar icon, not a native
`<input type="date">`. Next.js's filter-bar template uses
`<input type="date">`. The "dateInputs delta" line below therefore
flags only when there is also a *visible filter bar gap* once you look
at the actual element-tree.

## Per-route results

### Row 1 — market-data/market-data
- **Status:** PASS
- **Reflex DOM:** `colIds=[ag-Grid-RowNumbersColumn, ag-Grid-SelectionColumn, ticker, listed_shares, last_volume, last_price, vwap_price, bid, ask, chg_1d_pct, implied_vol_pct, market_status, created_by]` (13), rows=12, dateInputs=0, compactBtn=true, autoRefresh=true, exportBtn=false (under Generate dropdown, not a top-level button), sidebar=false (no class*=notification on the doc body), statusBar=true.
- **Next.js DOM:** identical 13 col-ids (only the *order* of the pinned `ticker` vs `ag-Grid-SelectionColumn` differs because Next.js pins `ticker` left-of-checkbox while Reflex pins it right-of-checkbox — cosmetic), rows=12, dateInputs=0, compactBtn=true, autoRefresh=true, exportBtn=false, statusBar=true.
- **Live flash:** maxFlashIn6s = 4 (Reflex) and 4 (Next.js).
- **Sort interaction:** click `Last Price` header — Reflex `aria-sort` `none → ascending`; Next.js (after page reload to clear persisted state) `none → ascending`. PASS.
- **Existing findings touched:** F-2 (refresh cadence already overridden — OK).
- **New findings:** —
- **Notes:** 13/13 columns match exactly; pinned-checkbox / ticker order differs cosmetically.

### Row 2 — market-data/fx-data
- **Status:** PASS
- **Reflex DOM:** 10 col-ids `[ag-Grid-RowNumbersColumn, ag-Grid-SelectionColumn, ticker, last_price, bid, ask, created_by, created_time, updated_by, update]`, rows=10, dateInputs=0, autoRefresh=true, statusBar=true.
- **Next.js DOM:** identical 10 col-ids, rows=10 (after a 5-s wait — initial probe caught the AG Grid "Loading..." overlay because the FastAPI fetch had not yet resolved; expected behaviour, not a finding), dateInputs=0, autoRefresh=true.
- **Live flash:** Reflex maxFlashIn6s=9, Next.js maxFlashIn6s=12. Both tick at 2 s via simulators.
- **Existing findings touched:** F-2 (already overridden — OK).
- **New findings:** —
- **Notes:** Initial-load latency on Next.js side made the first probe show 0 rows + "Loading..." overlay; transient.

### Row 3 — market-data/ticker-data (slug remap reference-data ↔ ticker-data)
- **Status:** MISMATCH (pre-existing)
- **Reflex DOM:** 12 col-ids, rows=0, overlayText="No rows to display", dateInputs=0, autoRefresh=**false**, statusBar=true.
- **Next.js DOM:** identical 12 col-ids, rows=2, overlayText="", dateInputs=0, autoRefresh=**true**, statusBar=true.
- **Existing findings touched:** F-13 / F-29 (slug mismatch — landing matrix already records this), F-2 / F-22 (Reflex mixin polls + simulates; Next.js does not — pre-existing).
- **New findings:** see W1-A below (auto-refresh switch visibility).
- **Notes:** Headers identical (`Ticker / Currency / FX Rate / Sector / Company / PO Lead Manager / FMat Cap / SMkt Cap / 1D% / DTL`). Row delta (0 vs 2) is mock-data drift between the two backends, not a parity gap. The auto-refresh-switch visibility delta (W1-A) is the new finding.

### Row 4 — market-data/historical-data
- **Status:** MISMATCH (pre-existing F-3)
- **Reflex DOM:** 12 col-ids, rows=46, **dateInputs=3** (Start Date + End Date in `_position_date_bar()` plus the toolbar date), compactBtn=true, autoRefresh=true.
- **Next.js DOM:** identical 12 col-ids, rows=64, **dateInputs=1** (only the toolbar single-date — the page does *not* import `DateRangeFilterBar`).
- **Existing findings touched:** **F-3** (no filter bar; Reflex ticker multi-select + date range), F-2 (5 s mixin cadence on Reflex — visible in F-22 "historical-data: 5 s mixin").
- **New findings:** —
- **Notes:** Row-count delta (46 vs 64) is the natural consequence of Reflex's narrower default date window. Once the Reflex date-range bar is ported (F-3) the Next.js page should also default to a narrower window.

### Row 5 — market-data/trading-calendar
- **Status:** MISMATCH (pre-existing F-3)
- **Reflex DOM:** 13 col-ids `[…, trade_date, day_of_week, usa, hkg, jpn, aus, nzl, kor, chn, twn, ind]`, rows=46, **dateInputs=3** (`_date_range_bar()` Start + End + toolbar single date), autoRefresh=**false**.
- **Next.js DOM:** identical 13 col-ids, rows=64, **dateInputs=1** (toolbar single date only), autoRefresh=**true**.
- **Existing findings touched:** **F-3** (date-range filter bar missing); see W1-A below for auto-refresh-switch visibility.
- **New findings:** —
- **Notes:** Same diagnosis as Row 4 — narrower window on Reflex.

### Row 6 — market-data/market-hours
- **Status:** PASS (with W1-A note)
- **Reflex DOM:** 9 col-ids `[…, market, ticker, session, local_time, session_period, is_open, timezone]`, rows=2, dateInputs=0, autoRefresh=**false** (no toggle rendered).
- **Next.js DOM:** identical 9 col-ids, rows=2, dateInputs=0, autoRefresh=**true** (toggle rendered).
- **Existing findings touched:** —
- **New findings:** W1-A (auto-refresh switch visibility — see below).
- **Notes:** Column structure parity is exact. Auto-refresh-switch visibility differs but is a wrapper-level concern documented in W1-A.

### Row 7 — positions/positions
- **Status:** PASS
- **Reflex DOM:** 11 col-ids `[…, ticker, trade_date, deal_num, detail_id, underlying, company_name, account_id, pos_loc, notional]`, rows=40, dateInputs=2, autoRefresh=true, statusBar=true.
- **Next.js DOM:** identical 11 col-ids, rows=40, dateInputs=2, autoRefresh=true.
- **Filter test (Ticker = "AAPL"):** Reflex 0 rows, Next.js 0 rows (AAPL absent from mock — both filter correctly).
- **Context-menu test (right-click first cell):** identical 12-item menus on both: `Cut / Copy / Copy with Headers / Copy with Group Headers / Paste / Export`.
- **Range-select baseline:** both grids report `.ag-cell-range-selected` count = 0 prior to interaction (cellSelection enabled on both).
- **Existing findings touched:** none functional.
- **New findings:** —
- **Notes:** Pinned-ticker delta (Reflex pins `ticker` after `ag-Grid-SelectionColumn`, Next.js pins it before) is cosmetic.

### Row 8 — positions/stock-position
- **Status:** PASS (no parity gap; Next.js delta is an enhancement)
- **Reflex DOM:** 13 col-ids, rows=20, dateInputs=1 (the Reflex floating filter on `Trade Date` is a real `<input type="date">`; the page-level position-date control is rendered as `<input type="text">` with a custom calendar icon, so it does not match `input[type="date"]`).
- **Next.js DOM:** identical 13 col-ids, rows=20, dateInputs=2 (page-level `Position Date` input is a real `<input type="date">` *plus* the floating filter — i.e. *more* date controls than Reflex).
- **Existing findings touched:** none for this row (pre-audit code parity says "PASS").
- **New findings:** —
- **Notes:** Apparent Reflex/Next.js dateInputs delta (1 vs 2) is an artifact of input-element type, not a missing control. Verified by comparing the full inputs list — both render a position-date strip; Next.js's is a native date input.

### Row 9 — positions/warrant-position
- **Status:** PASS
- **Reflex DOM:** 13 col-ids `[…, ticker, trade_date, deal_num, detail_id, underlying, company_name, sec_id, sec_type, subtype, currency, account_id]`, rows=10, dateInputs=1.
- **Next.js DOM:** identical 13 col-ids, rows=10, dateInputs=2 (same input-element-type artefact as Row 8).
- **Existing findings touched:** —
- **New findings:** —
- **Notes:** —

### Row 10 — positions/bond-positions
- **Status:** PASS
- **Reflex DOM:** 13 col-ids (identical shape to warrant-position), rows=10, dateInputs=1.
- **Next.js DOM:** identical 13 col-ids, rows=10, dateInputs=2.
- **Existing findings touched:** —
- **New findings:** —
- **Notes:** —

### Row 11 — positions/trade-summary
- **Status:** PASS (Next.js superset — no parity loss)
- **Reflex DOM:** 14 col-ids `[…, ticker, deal_num, detail_id, underlying, account_id, company_name, sec_id, sec_type, subtype, currency, closing_date, divisor]`, rows=16, dateInputs=1, autoRefresh=true.
- **Next.js DOM:** identical 14 col-ids, rows=16, dateInputs=3 (Next.js renders a `From` + `To` date range above the grid PLUS a `Closing Date` floating-filter input, while Reflex only ships the toolbar date).
- **Existing findings touched:** —
- **New findings:** —
- **Notes:** Next.js trade-summary actually carries a **richer** filter bar than Reflex. Not flagging because direction is "Next.js > Reflex"; brief asks for parity gaps, not Reflex superset gaps.

## Proposed new findings (W1-A..)

### W1-A — Auto-refresh toggle rendered on Next.js pages where Reflex hides it
- **Severity:** Low
- **Category:** 2 (behavioural)
- **Reflex source:** Reflex's wrapper conditionally renders the auto-refresh switch only when the page declares an `auto_refresh` mixin (`Portfolio-Management-Tool-reflex/app/components/shared/toolbar.py` — gated on the per-page mixin). Pages without a refresh task (`market-data/reference-data`, `market-data/trading-calendar`, `market-data/market-hours`, plus the other "9 pages" called out under F-2) ship no `[role=switch]` element.
- **Next.js source:** `nextjs-frontend/components/grid/data-grid.tsx:104-243` — `showAutoRefresh` defaults to `false`, but every page in the matrix opts in (`grep -rl showAutoRefresh nextjs-frontend/app/dashboard | wc -l` ≈ 25). The toggle therefore renders on `market-data/{ticker-data, trading-calendar, market-hours}` even though those pages have no underlying simulator and no mixin-equivalent on Reflex.
- **Browser repro:** open `:3001/pmt/market-data/market-hours` — DOM probe `[role=switch], [aria-label*="auto" i]` returns `[]`. Open `:3000/dashboard/market-data/market-hours` — same probe returns `[{tag: "INPUT", label: "Auto refresh"}]`. Same delta on `trading-calendar` and `market-data/reference-data ↔ ticker-data`.
- **Suggested fix:** Either (a) drop `showAutoRefresh` on the three calmer market-data pages so the wrapper hides the toggle, or (b) extend `<DataGrid>` to auto-hide the toggle when the page provides neither `simulateUpdate` nor an explicit `autoRefreshIntervalMs < 30 000`. Option (a) is the smaller change and is consistent with how Reflex draws this distinction.
- **Risk:** None. The toggle is wired correctly when on; removing it on calm pages is purely subtractive.

## Summary
- Routes processed: 11
- PASS: 8 / MISMATCH: 3
- New findings: 1 (W1-A)
- Existing findings hit: F-2 (Rows 1, 2, 6 wrapper-default note), F-3 (Rows 4, 5), F-13 / F-29 (Row 3 slug remap), F-22 (Row 3 simulator note)
- Blockers encountered: none
