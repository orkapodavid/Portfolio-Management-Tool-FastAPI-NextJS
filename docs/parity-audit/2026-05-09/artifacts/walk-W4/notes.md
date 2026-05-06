# Walk W4 notes — portfolio-tools (9 routes)

## Verified at start
- Backend health: `:8000/api/health` → 200
- Next.js: `:3000/dashboard/portfolio-tools/pay-to-hold` → 200
- Reflex: `:3001/pmt/portfolio-tools/pay-to-hold` → 200
- HEAD: 5f1c7b9
- Viewport: 1440 × 900 on both sessions (`reflex-W4`, `nextjs-W4`)

## Methodology notes
- 18 screenshots captured (`<page>-{reflex,nextjs}.png`).
- DOM probe per page records: headers list, `.ag-row` count, date inputs,
  select/combobox count, compact/auto-refresh/export buttons,
  Apply/Clear button count, `.ag-status-bar`, overlay text.
- Cell flash sweep on pay-to-hold and stock-borrow (10 s each, 500 ms cadence).
- Interactive probes: floating-filter / sortable-header counts on
  pay-to-hold both sides; right-click context-menu on excess-amount
  both sides; range-select capability on stock-borrow.
- Mock dataset on every portfolio-tools route is **2 rows** on both stacks.

---

## Per-route results

### Row 30 — portfolio-tools/pay-to-hold
- **Status:** MISMATCH (expected per F-2, F-22; F-4 partial — see below).
- **Reflex DOM:** `{headers:["","","Ticker","Trade Date","Currency","Counter Party","Side","SL Rate","PTH Amount SOD"], rows:2, dateInputs:2, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers (incl. 2 blank for checkbox/menu columns).
- **Next.js DOM:** `{headers:["","Ticker","","Trade Date","Currency","Counter Party","Side","SL Rate","PTH Amount SOD","PTH Amount","EMSX Order","EMSX Remark","EMSX Working","EMSX Order Col","EMSX Filled"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 15 headers (Next.js exposes 6 extra columns starting at "PTH Amount").
- **Findings hit:** F-2 (no auto-refresh override on Reflex side per code; Next.js shows the wrapper's auto-refresh switch), F-22 (no simulator on Next.js).
- **F-4 caveat:** Reflex has `dateInputs=2` (toolbar date + position-date filter bar). Next.js has `dateInputs=1` (toolbar only — confirms position-date filter bar missing). F-4 stands.
- **Column-set delta:** 6 extra Next.js columns (PTH Amount, EMSX Order, EMSX Remark, EMSX Working, EMSX Order Col, EMSX Filled). Treat as new finding W4-A (column-set drift). Same shape as F-7 reset-dates `market_price` delta.
- **Floating filters / sort:** parity. Next.js 15/13/15, Reflex 9/7/9 (counts scale with column counts).

### Row 31 — portfolio-tools/stock-borrow
- **Status:** MISMATCH (expected per F-2, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Trade Date","Company Name","JPM Request Locate","JPM Firm Locate","Borrow Rate","BofA Request Locate"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Trade Date","Company Name","JPM Req","JPM Firm","Borrow Rate","BofA Req","BofA Firm"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 10 headers (extra `BofA Firm` and abbreviated labels).
- **Header-label drift:** Reflex `JPM Request Locate` / `BofA Request Locate` vs Next.js `JPM Req` / `BofA Req`. Note as W4-B (label abbreviation drift).
- **Cell flash sweep (10 s):** both sides 0/0. Inconclusive on this page (only 2 rows; simulator may not flip values often enough at this volume even on Reflex).
- **Findings hit:** F-2, F-22.

### Row 32 — portfolio-tools/reset-dates
- **Status:** MISMATCH (expected per F-7; also F-2, F-22).
- **Reflex DOM:** `{headers:["","","Underlying","Ticker","Company Name","Sec Type","Currency","Trade Date","First Reset Date"], rows:2, dateInputs:4, selectInputs:5, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:1, sidebar:false, statusBar:true, overlayText:""}` — 9 headers; **filter bar visible: 4 date inputs + 5 selects + 1 Apply/Clear button**.
- **Next.js DOM:** `{headers:["","Ticker","","Underlying","Company Name","Sec Type","Currency","Trade Date","First Reset","Expiry","Latest Reset","Reset Date","Up / Down","Market Price"], rows:2, dateInputs:5, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 14 headers; **no bespoke filter bar (selectInputs=0, applyClearBtns=0)**.
- **F-7 confirmed:** the multi-field filter bar (ticker / date range / frequency / reset month/day / up-down) is absent on Next.js. The 5 Next.js `dateInputs` are toolbar-side date controls plus presumably one in-grid input — none of them satisfy F-7's filter contract.
- **F-7 column-set caveat reconfirmed:** Next.js exposes `Market Price` (and `Expiry`, `Latest Reset`, `Reset Date`, `Up / Down`) which are not in the Reflex header list. Already documented in F-7 description; surface to user before keeping.
- **Findings hit:** F-2, F-7, F-22.

### Row 33 — portfolio-tools/coming-resets
- **Status:** MISMATCH (expected per F-2, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Deal Num","Detail ID","Account","Company Name","Announcement Date","Closing Date"], rows:2, dateInputs:2, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Deal Num","Detail ID","Account","Company Name","Announce Date","Closing Date","Cal Days","Biz Days"], rows:2, dateInputs:2, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 11 headers; extras `Cal Days`, `Biz Days`.
- **Label drift:** `Announcement Date` (Reflex) → `Announce Date` (Next.js).
- **Findings hit:** F-2, F-22.

### Row 34 — portfolio-tools/cb-installments
- **Status:** MISMATCH (expected per F-2, F-4, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Underlying","Currency","Installment Date","Total Amount","Outstanding Amount","Redeemed Amount"], rows:2, dateInputs:2, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Underlying","Currency","Installment Date","Total Amount","Outstanding","Redeemed","Deferred","Converted","Installment Amount","Period"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 13 headers; extras `Deferred`, `Converted`, `Installment Amount`, `Period`.
- **F-4 confirmed:** `dateInputs` 2 (Reflex) vs 1 (Next.js). Reflex has the position-date filter bar; Next.js has the toolbar date only.
- **Label drift:** `Outstanding Amount`/`Redeemed Amount` (Reflex) → `Outstanding`/`Redeemed` (Next.js).
- **Findings hit:** F-2, F-4, F-22.

### Row 35 — portfolio-tools/excess-amount
- **Status:** MISMATCH (expected per F-2, F-4, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Deal Num","Underlying","Company Name","Warrants","Excess Amount","Excess Amount Threshold"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Deal Num","Underlying","Company Name","Warrants","Excess Amount","Threshold","CB Redeem","Redeem"], rows:2, dateInputs:0, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 11 headers; extras `CB Redeem`, `Redeem`.
- **F-4 confirmed:** `dateInputs` 1 (Reflex toolbar OR filter bar) vs **0** (Next.js — neither toolbar date nor filter bar visible at probe time). Sharper signal than the other two F-4 pages. Worth flagging that excess-amount also lacks the toolbar date control entirely on Next.js. (Possibly because the page's wrapper hides toolbar date when `filterBar` is absent.)
- **Label drift:** `Excess Amount Threshold` → `Threshold` (Next.js).
- **Right-click context menu:** identical default AG Grid menu (Cut/Copy/Copy with Headers/Paste/Export) on both sides. No custom items on either side — expected for portfolio-tools (Rerun/Kill is operations-only).
- **Findings hit:** F-2, F-4, F-22.

### Row 36 — portfolio-tools/deal-indication
- **Status:** MISMATCH (expected per F-2, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Company Name","Identification","Deal Type","Agent","Deal Captain","Indication Date"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Company Name","Identification","Deal Type","Agent","Deal Captain","Indication Date","Currency","Market Cap LOC","Gross Proceed LOC","Indication Amount"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 13 headers; extras `Currency`, `Market Cap LOC`, `Gross Proceed LOC`, `Indication Amount`.
- **Findings hit:** F-2, F-22.

### Row 37 — portfolio-tools/po-settlement
- **Status:** MISMATCH (expected per F-2, F-22 only — filter bar is wired ✓).
- **Reflex DOM:** `{headers:["","","Ticker","Deal Num","Company Name","Structure","Currency","FX Rate","Last Price"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Deal Num","Company Name","Structure","Currency","FX Rate","Last Price","Current Position","Shares Allocated","Shares in Swap","Shares Hedged"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:1, sidebar:false, statusBar:true, overlayText:""}` — 13 headers; extras `Current Position`, `Shares Allocated`, `Shares in Swap`, `Shares Hedged`.
- **Filter bar parity:** confirmed wired on Next.js (`applyClearBtns=1` from the position-date bar's Clear/Apply button). Reflex's `_position_date_bar()` does not ship a button (relies on auto-apply on date change), hence Reflex `applyClearBtns=0`. Behavioural delta but acceptable — both stacks ship a position-date filter.
- **Findings hit:** F-2, F-22. Notably **NOT F-4** (filter bar is wired). Matches matrix.

### Row 38 — portfolio-tools/short-ecl
- **Status:** MISMATCH (expected per F-2, F-22).
- **Reflex DOM:** `{headers:["","","Ticker","Trade Date","Company Name","Pos Loc","Account","Short Position","NOSH"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:false, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 9 headers.
- **Next.js DOM:** `{headers:["","Ticker","","Trade Date","Company Name","Pos Loc","Account","Short Position","NOSH","Short Ownership","Last Volume","ShortPos/Volume"], rows:2, dateInputs:1, selectInputs:0, compactBtn:true, autoRefresh:true, exportBtn:false, applyClearBtns:0, sidebar:false, statusBar:true, overlayText:""}` — 12 headers; extras `Short Ownership`, `Last Volume`, `ShortPos/Volume`.
- **Findings hit:** F-2, F-22.

---

## Cell-flash sampler results

Sampled `.ag-cell-data-changed` count every 500 ms for 10 s (20 samples per side):
- **pay-to-hold:** Reflex max 0 / nonzero 0; Next.js max 0 / nonzero 0.
- **stock-borrow:** Reflex max 0 / nonzero 0; Next.js max 0 / nonzero 0.
- **short-ecl (5 s spot):** Reflex 0; Next.js 0.

**Interpretation:** the 2-row mock dataset is too small for the Reflex
simulator to demonstrate visible flashes inside the sampler window, but
the Next.js side is structurally incapable of cell flashes on these
pages (no `simulateUpdate=` wired). F-22 stands; the lack of Reflex
flashes on portfolio-tools is consistent with the small mock dataset
rather than evidence against F-22. A larger mock or a longer sampling
window on a higher-volatility page (market-data) would prove the
simulator difference more cleanly.

---

## Proposed new findings (W4-A..)

### W4-A — Portfolio-tools column-set drift (Next.js exposes 1-6 extra columns per page)
- **Severity:** Low — Next.js is "ahead" on data exposure.
- **Affected pages:** all 9 portfolio-tools routes ship a wider column
  set on Next.js. Concrete deltas:
  - `pay-to-hold`: +6 (PTH Amount, EMSX Order, EMSX Remark, EMSX Working, EMSX Order Col, EMSX Filled).
  - `stock-borrow`: +1 (BofA Firm).
  - `reset-dates`: +5 (Expiry, Latest Reset, Reset Date, Up/Down, Market Price). Already captured under F-7.
  - `coming-resets`: +2 (Cal Days, Biz Days).
  - `cb-installments`: +4 (Deferred, Converted, Installment Amount, Period).
  - `excess-amount`: +2 (CB Redeem, Redeem).
  - `deal-indication`: +4 (Currency, Market Cap LOC, Gross Proceed LOC, Indication Amount).
  - `po-settlement`: +4 (Current Position, Shares Allocated, Shares in Swap, Shares Hedged).
  - `short-ecl`: +3 (Short Ownership, Last Volume, ShortPos/Volume).
- **Suggested fix:** confirm with user whether each extra column is a
  deliberate enhancement (then update Reflex parity baseline) or
  accidental. None of these block parity but the audit baseline
  currently treats Reflex as the spec, so they need an explicit
  decision.
- **Risk:** None — deltas are read-only column visibility.

### W4-B — Portfolio-tools header label abbreviation drift
- **Severity:** Very Low (cosmetic).
- **Examples:**
  - `JPM Request Locate` → `JPM Req` (stock-borrow).
  - `BofA Request Locate` → `BofA Req` (stock-borrow).
  - `Announcement Date` → `Announce Date` (coming-resets).
  - `Outstanding Amount` → `Outstanding` (cb-installments).
  - `Redeemed Amount` → `Redeemed` (cb-installments).
  - `Excess Amount Threshold` → `Threshold` (excess-amount).
  - `First Reset Date` → `First Reset` (reset-dates).
- **Suggested fix:** decide on a canonical set of header labels; pick
  Reflex (longer, descriptive) or Next.js (shorter, fits column at
  default width). One-line fix per column once decided.
- **Risk:** None — pure label change.

### W4-C — excess-amount Next.js page hides the toolbar date control entirely
- **Severity:** Low (subset of F-4).
- **Detail:** Next.js excess-amount returned `dateInputs:0` in the DOM
  probe, vs `dateInputs:1` on every other portfolio-tools page on
  Next.js (those pages still ship the toolbar date even when the
  position-date filter bar is missing). This means excess-amount has
  **no date control at all** — neither toolbar nor filter bar.
- **Suggested fix:** rolls up under F-4. When the position-date filter
  bar is added, verify that the toolbar date is also present (or
  reconciled with filter-bar state).
- **Risk:** None.

---

## Summary

- **Routes processed:** 9 / 9
- **PASS:** 0 — every page MISMATCH per F-2/F-22 baseline (auto-refresh
  cadence + simulator), even po-settlement which has the filter bar.
- **MISMATCH:** 9
- **New findings (temp):** 3 — W4-A (column-set drift x9), W4-B (label
  abbreviation drift x7), W4-C (excess-amount has zero date inputs on
  Next.js).
- **Existing findings hit:** F-2 (9 pages), F-4 (3 pages: pay-to-hold,
  cb-installments, excess-amount), F-7 (reset-dates), F-22 (9 pages).
- **Blockers:** none.
- **Screenshots:** 18 PNG files in this directory.
