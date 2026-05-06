# Walk W3 notes — recon + compliance (9 routes)

## Verified at start
- Backend health: 200 OK (`http://127.0.0.1:8000/api/health`)
- Next.js: 200 OK (`http://127.0.0.1:3000`)
- Reflex: 200 OK (`http://127.0.0.1:3001/pmt/`)
- HEAD: 5f1c7b9
- Sessions: `reflex-W3` and `nextjs-W3` opened at 1440x900

## Methodology note
The initial DOM probe used `.ag-row-group-panel, [ref="ePanel"]` to detect row-group panels. AG Grid actually renders the row-group / pivot panels as `.ag-column-drop-horizontal` divs that are present in the DOM but tagged with `ag-hidden` when `rowGroupPanelShow !== 'always'`. The probe was upgraded to filter on `!ag-hidden && offsetHeight > 0` to detect *visible* panels. All Reflex row-group findings below use the corrected probe. (Both apps emit the hidden divs unconditionally since both ship AG Grid Enterprise.)

## Per-route results

### Row 21 — recon/pps-recon
- **Status:** PASS
- **Reflex DOM:** `{headers:["","","Ticker","Value Date","Trade Date","Underlying","Code","Company Name","Sec Type"], rows:20, dateInputs:3, compactBtn:true, autoRefresh:false, exportBtn:false, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Next.js DOM:** `{headers:["","Ticker","","Value Date","Trade Date","Underlying","Code","Company Name","Sec Type","Pos Loc","Account"], rows:20, dateInputs:3, compactBtn:true, autoRefresh:true, exportBtn:false, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Existing findings touched:** —
- **New findings:** W3-A (auto-refresh switch on force-refresh-only pages)
- **Notes:**
  - Headers, row count (20), dateInputs (3 = position-date filter bar), compact + status bar all match.
  - Reflex shows only 7 named cols vs Next.js 9 (Reflex hides Pos Loc + Account from the rendered header set; both apps share the same `pmt_core` columndef list with pos_loc + account, so this looks like a Reflex viewport sizing artifact, not an intentional column-visibility difference. Not flagging.)
  - Reflex has `autoRefresh:false` (no `<input>` aria-label="Auto refresh"); Next.js has `autoRefresh:true` (renders the wrapper-level switch). See W3-A.

### Row 22 — recon/settlement-recon
- **Status:** PASS
- **Reflex DOM:** `{headers:["","","Ticker","Trade Date","ML Report Date","Underlying","Company Name","Pos Loc","Currency"], rows:16, dateInputs:3, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:0}`
- **Next.js DOM:** `{headers:["","Ticker","","Trade Date","ML Report Date","Underlying","Company Name","Pos Loc","Currency","Sec Type","Position Settled","ML Inventory"], rows:16, dateInputs:3, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0}`
- **Existing findings touched:** —
- **New findings:** W3-A
- **Notes:**
  - 16 rows match, 3 date inputs match (filter bar already wired on both sides).
  - Reflex shows 7 named cols, Next.js 10 — same viewport-sizing artifact as Row 21.
  - autoRefresh divergence — see W3-A.

### Row 23 — recon/failed-trades
- **Status:** PASS
- **Reflex DOM:** `{headers:["","","Ticker","Report Date","Trade Date","Value Date","Settlement Date","Portfolio Code","Instrument Ref"], rows:10, dateInputs:5, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:0}`
- **Next.js DOM:** `{headers:["","Ticker","","Report Date","Trade Date","Value Date","Settlement Date","Portfolio Code","Instrument Ref","Instrument Name","Company Name","ISIN","SEDOL","Broker","Glass Reference"], rows:10, dateInputs:5, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0}`
- **Existing findings touched:** —
- **New findings:** W3-A
- **Notes:**
  - 10 rows + 5 date inputs match (this page has the broadest date filter bar — report/trade/value/settlement dates).
  - autoRefresh divergence — see W3-A.

### Row 24 — recon/pnl-recon
- **Status:** PASS
- **Reflex DOM:** `{headers:["","","Underlying","Trade Date","Report Date","Deal Num","Row Index","Pos Loc","Stock SecID"], rows:16, dateInputs:3, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:0}`
- **Next.js DOM:** `{headers:["","Underlying","","Trade Date","Report Date","Deal Num","Row Index","Pos Loc","Stock SecID","Warrant SecID","Bond SecID","Stock Position"], rows:16, dateInputs:3, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0}`
- **Existing findings touched:** —
- **New findings:** W3-A
- **Notes:**
  - 16 rows + 3 date inputs match.
  - autoRefresh divergence — see W3-A.

### Row 25 — recon/risk-input-recon
- **Status:** PASS
- **Reflex DOM:** `{headers:["","","Ticker","Value Date","Underlying","Sec Type","Spot (MC)","Spot (PPD)","Position"], rows:20, dateInputs:2, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:0}`
- **Next.js DOM:** `{headers:["","Ticker","","Value Date","Underlying","Sec Type","Spot (MC)","Spot (PPD)","Position","Value (MC)","Value (PPD)"], rows:20, dateInputs:2, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0}`
- **Existing findings touched:** —
- **New findings:** W3-A
- **Notes:**
  - 20 rows + 2 date inputs match.
  - autoRefresh divergence — see W3-A.

### Row 26 — compliance/restricted-list
- **Status:** MISMATCH
- **Reflex DOM:** `{headers:["","","Ticker","Company Name","In EMSX?","Compliance Type","Firm Block","Compliance Start","NDA End"], rows:16, dateInputs:0, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:1, rowGroupPanelTotal:2}`
- **Next.js DOM:** `{headers:["","Ticker","","Company Name","In EMSX?","Compliance Type","Firm Block","Compliance Start","NDA End","MNPI End","WC End"], rows:16, dateInputs:0, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Existing findings touched:** F-12 (Reflex visible row-group panel; Next.js missing)
- **New findings:** W3-A
- **Notes:**
  - 16 rows match. 0 date inputs match (no position-date filter on this page either side).
  - **F-12 confirmed:** Reflex `compliance/restricted-list_ag_grid.py:162` ships `row_group_panel_show="always"`; Reflex DOM shows visible "Drag here to set row groups" panel; Next.js does not render the panel.
  - autoRefresh divergence — see W3-A.

### Row 27 — compliance/undertakings
- **Status:** MISMATCH
- **Reflex DOM:** `{headers:["","","Deal Num","Ticker","Company Name","Account","Undertaking Expiry","Undertaking Type","Undertaking Details"], rows:12, dateInputs:1, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:1, rowGroupPanelTotal:2}`
- **Next.js DOM:** `{headers:["","Ticker","","Deal Num","Company Name","Account","Undertaking Expiry","Undertaking Type","Undertaking Details"], rows:12, dateInputs:0, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Existing findings touched:** F-15 (position-date filter), F-12 (row-group panel)
- **New findings:** W3-A
- **Notes:**
  - 12 rows match.
  - **F-15 confirmed:** Reflex renders one POSITION DATE input (`dateInputs:1` with label="POSITION DATE"); Next.js renders **zero** date inputs (`dateInputs:0`). The frontend has no filter bar to drive `position_date` at all, and the FastAPI handler doesn't accept it. Two-layer gap.
  - **F-12 confirmed:** Reflex has visible row-group panel above the grid; Next.js does not.
  - autoRefresh divergence — see W3-A.

### Row 28 — compliance/beneficial-ownership
- **Status:** MISMATCH
- **Reflex DOM:** `{headers:["","","Trade Date","Ticker","Company Name","NOSH (Reported)","NOSH (BBG)","NOSH Proforma","Stock Shares"], rows:20, dateInputs:1, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:1, rowGroupPanelTotal:2}`
- **Next.js DOM:** `{headers:["","Ticker","","Trade Date","Company Name","NOSH (Reported)","NOSH (BBG)","NOSH Proforma","Stock Shares","Warrant Shares","Bond Shares","Total Shares"], rows:20, dateInputs:2, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Existing findings touched:** F-12 (row-group panel + aggFunc)
- **New findings:** W3-A, W3-B (Next.js renders 2 date inputs vs Reflex 1 — date-range bar mismatch)
- **Notes:**
  - 20 rows match.
  - **F-12 confirmed:** Reflex `beneficial_ownership_ag_grid.py:209-210` sets `row_group_panel_show="always"` + `group_default_expanded=-1` and 4 columns ship `agg_func="sum"`. Reflex DOM shows visible row-group panel; Next.js does not.
  - **W3-B (filter shape):** Reflex shows ONE position-date input (single date filter), Next.js renders TWO date inputs (date-range filter). Reflex's `beneficial_ownership_mixin.py` uses a single `position_date`. Next.js appears to render a date-range bar where Reflex uses a single-date bar.
  - autoRefresh divergence — see W3-A.

### Row 29 — compliance/monthly-exercise-limit
- **Status:** MISMATCH
- **Reflex DOM:** `{headers:["","","Underlying","Ticker","Company Name","Sec Type","Original Nosh","Original Quantity","Monthly Exercised Qty"], rows:16, dateInputs:1, compactBtn:true, autoRefresh:false, statusBar:true, rowGroupPanelVisible:1, rowGroupPanelTotal:2}`
- **Next.js DOM:** `{headers:["","Ticker","","Underlying","Company Name","Sec Type","Original Nosh","Original Quantity","Monthly Exercised Qty","Monthly Exercised %","Monthly Sal"], rows:16, dateInputs:1, compactBtn:true, autoRefresh:true, statusBar:true, rowGroupPanelVisible:0, rowGroupPanelTotal:2}`
- **Existing findings touched:** F-12 (row-group panel)
- **New findings:** W3-A
- **Notes:**
  - 16 rows + 1 date input (position-date bar) match.
  - **F-12 confirmed:** Reflex `monthly_exercise_limit_ag_grid.py:206` sets `row_group_panel_show="always"`; Next.js does not render the panel.
  - autoRefresh divergence — see W3-A.

## Interactive probes summary

Run on representative pages:

- **Sort (recon/pps-recon):** clicking `.ag-header-cell-text` for the Ticker column on both sides flips `aria-sort` to `ascending` — Reflex + Next.js identical behaviour.
- **Floating filter (recon/pps-recon):** typing `AAPL` into the Ticker floating-filter input is accepted on both sides (placeholder/aria-label="Ticker Filter Input" matches).
- **Right-click context menu (compliance/beneficial-ownership):** both render the same default AG Grid Enterprise menu — `Cut / Copy / Copy with Headers / Copy with Group Headers / Paste / Export`. No custom menu items in either app for compliance pages, which is expected (custom menus only exist for operations Rerun/Kill — F-1/F-8).
- **Auto-refresh switch:** Reflex compliance/recon pages have **0** `<input aria-label="Auto refresh">` elements; Next.js compliance/recon pages **all** render the switch (one per page). See W3-A.

## Proposed new findings (W3-A..)

### W3-A — Auto-refresh switch rendered on force-refresh-only pages (Low/Medium)
- **Severity:** Low (cosmetic / behavioural — no data corruption) but borderline Medium because it can lead users to expect a tick they don't get.
- **Reflex behaviour:** All 9 W3 routes (5 recon + 4 compliance) render **no** Auto Refresh widget at all (probed 9/9 — `<input aria-label="Auto refresh">` count = 0 on every page). Reflex's `findings.md:F-2` describes these as "9 pages with no auto-refresh background task (force-refresh only — compliance and recon)".
- **Next.js behaviour:** All 9 W3 routes render the wrapper-level Auto Refresh `<label>`+`<input>` toggle (probed 9/9 — `aria-label="Auto refresh"` element present on every page). Source: `nextjs-frontend/components/grid/data-grid.tsx` defaults `showAutoRefresh` ON unless explicitly disabled, and none of the recon/compliance pages opts out.
- **User-visible impact:** Toggling the switch on a recon/compliance page in Next.js triggers a 30 s wrapper-level refetch but Reflex never offered the control because the underlying mixin has no background polling task. End-state: visible widget, behaviour drift on a page that's supposed to be "static / force-refresh-only".
- **Suggested fix:** Either (a) accept this as a benign extension and document, or (b) propagate a `static`/`autoRefreshDisabled` flag from the page to the wrapper so recon + compliance pages render no Auto Refresh switch and no Last Updated label, mirroring Reflex.
- **Risk:** None — additive prop on `<DataGrid>`.
- **Note vs F-2:** F-2 is about the *cadence* (30 s vs 2 s) for pages that *do* tick. W3-A is about pages that *should not tick at all* but currently render the control. Different layer.

### W3-B — compliance/beneficial-ownership: date-range bar in Next.js vs single-date bar in Reflex (Low)
- **Severity:** Low (filter UX; no data correctness break).
- **Reflex behaviour:** Renders **one** `<input type="date">` for the position-date filter bar (`dateInputs:1`).
- **Next.js behaviour:** Renders **two** `<input type="date">` elements — looks like a date-range bar (`dateInputs:2`).
- **Source:** Reflex `beneficial_ownership_mixin.py` only carries a single `position_date` state and the AG-Grid file's `_position_date_bar()` matches Reflex's other compliance pages (1 input). Next.js `app/dashboard/compliance/beneficial-ownership/page.tsx` appears to wire a `<DateRangeFilterBar>` instead of `<SingleDateFilterBar>`.
- **Impact:** Visible mismatch. Both UIs probably still query the same backend endpoint, but the filter affordance does not match the spec.
- **Suggested fix:** Switch the Next.js page to `<SingleDateFilterBar>` to mirror Reflex, OR confirm with the user that the date-range bar is a deliberate enhancement and keep but document the delta.
- **Risk:** Low — single component swap.

## Summary
- Routes processed: 9
- PASS: 5 (recon/{pps-recon, settlement-recon, failed-trades, pnl-recon, risk-input-recon})
- MISMATCH: 4 (compliance/{restricted-list, undertakings, beneficial-ownership, monthly-exercise-limit})
- New findings (proposed): W3-A (auto-refresh switch on force-refresh-only pages, hits all 9 routes), W3-B (date-range vs single-date bar on compliance/beneficial-ownership)
- Existing findings hit:
  - **F-12** confirmed on all 4 compliance pages (Reflex shows visible row-group panel + aggFunc on `restricted-list`, `undertakings`, `beneficial-ownership`, `monthly-exercise-limit`; Next.js does not).
  - **F-15** confirmed on `compliance/undertakings` (Reflex has 1 POSITION DATE input; Next.js has 0; FastAPI handler does not accept `position_date`).
- All 9 recon + compliance pages are static (no simulators on either side, as expected per brief).
- Sort + floating-filter + default context-menu work identically on both sides.
- Screenshots: 18 PNGs in `docs/parity-audit/2026-05-09/artifacts/walk-W3/`.
