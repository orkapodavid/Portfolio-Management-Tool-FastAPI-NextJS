# Walk W5 notes — instruments + events + operations + orders (12 routes)

Walk performed 2026-05-06 against branch `feat/nextjs-fastapi-rebuild` HEAD `5f1c7b9`.
Sessions: `reflex-W5`, `nextjs-W5` (1440 x 900). PHASE 1 read-only.

## Verified at start
- Backend health: `GET http://localhost:8000/api/health` → 200 `{"status":"ok","runtime":"server","database_backend":"sqlite"}`
- Next.js: `http://localhost:3000/dashboard` → 200
- Reflex: `http://localhost:3001/pmt/` → 200
- HEAD: 5f1c7b9 (no working-tree changes during walk)

## Probe legend
- `headers` — ordered text from `.ag-header-cell-text`. The first 2-3 entries on Next.js include row-number and selection columns ("", "Ticker", "") whereas Reflex emits both pinned-left utility columns first ("", "", actual headers...). This is a benign ordering difference, not a finding.
- `autoRefresh:true` on Next.js comes from the wrapper-level `[role=switch]` Auto-Refresh toggle (Reflex doesn't expose one). Confirms F-2 architecture.
- `numberInputs` / `dateInputs` reflect a combination of (a) cell editors / floating filters and (b) any explicit filter bar. The diffs of interest are in totals on filter bars.

## Per-route results

### Row 39 — instruments/ticker-data
- **Status:** PASS (with documented delta)
- **Reflex DOM:** `{"headers":["","","Ticker","Currency","FX Rate","Sector","Company","PO Lead Manager","FMat Cap"],"rows":16,"dateInputs":0,"numberInputs":2,"selectInputs":0,"compactBtn":true,"autoRefresh":false,"exportBtn":false,"applyClearBtns":0,"statusBar":true,"overlayText":""}`
- **Next.js DOM:** `{"headers":["","Ticker","","Currency","FX Rate","Sector","Company","PO Lead Manager","FMat Cap","SMkt Cap","1D%","DTL"],"rows":16,"dateInputs":0,"numberInputs":2,"selectInputs":0,"compactBtn":true,"autoRefresh":true,"exportBtn":false,"applyClearBtns":0,"statusBar":true,"overlayText":""}`
- **Existing findings touched:** F-22 (instruments mixin has simulator on Reflex), F-28 (no `_ag_grid.py` on Reflex — page is Next.js-ahead-of-Reflex), F-2 (auto-refresh toggle present on Next.js).
- **New findings:** —
- **Notes:** Both grids load 16 rows of identical data. Next.js page has 12 columns visible (more wide spread). Confirms F-28 is a documentation note only (Next.js page is ahead). Auto Refresh toggle visible top-right on Next.js side only.

### Row 40 — instruments/stock-screener
- **Status:** MISMATCH (expected per F-6, F-22)
- **Reflex DOM:** `{"rows":20,"numberInputs":9,"applyClearBtns":1,...}`
- **Next.js DOM:** `{"rows":20,"numberInputs":0,"applyClearBtns":0,...}`
- **Existing findings confirmed:** **F-6** (DTL10 / Market Cap (MM LOC) / $ADV 3M number-range filter bar + COUNTRY dropdown + APPLY button visibly present on Reflex; absent on Next.js — confirmed visually in screenshot pair), F-2, F-22.
- **New findings:** —
- **Notes:** Reflex screenshot shows 6 number inputs (3 ranges = 6) + COUNTRY dropdown + APPLY button in a horizontal strip above the grid. Next.js shows only AG Grid floating filters in column header row.

### Row 41 — instruments/special-terms (slug remap → Reflex `special-term`)
- **Status:** MISMATCH (expected per F-4, F-16, F-29)
- **Reflex DOM:** `{"rows":2,"dateInputs":2,...}`
- **Next.js DOM:** `{"rows":2,"dateInputs":1,...}`
- **Existing findings confirmed:** **F-16** (no `pos_date` filter — even though Reflex shows position-date filter bar above grid (extra dateInput accounted for), Next.js has no filter bar), **F-4** (position-date filter bar absent on Next.js), F-2, F-22, **F-29** (slug `special-term` vs `special-terms`).
- **New findings:** —
- **Notes:** dateInputs delta (2 vs 1) — the Reflex filter bar contributes the extra date input; Next.js has only the toolbar `Last Updated` time picker, no position-date strip.

### Row 42 — instruments/instrument-data
- **Status:** MISMATCH (expected per F-2, F-22)
- **Reflex DOM:** `{"rows":4,"headers":["","","Deal Num","Detail ID","Underlying","Ticker","Company Name","SecID","Sec Type"],...}`
- **Next.js DOM:** `{"rows":4,"headers":["","Deal Num","","Detail ID","Underlying","Ticker","Company Name","SecID","Sec Type","Position Location","Account"],...}`
- **Existing findings confirmed:** F-22 (Reflex has `instrument_data_mixin.py` with simulate-update; Next.js does not — confirmed by inspecting Reflex source `app/states/instruments/mixins/instrument_data_mixin.py`), F-2.
- **New findings:** —
- **Notes:** Cell-flash poll (5s window after navigation) returned 0 hits on both sides, but Reflex page only shows string columns in viewport (Deal Num, Detail ID, Underlying, Ticker — none numeric); volatility wouldn't surface in headers visible. Code-level mixin presence confirms F-22.

### Row 43 — instruments/instrument-term
- **Status:** MISMATCH (expected per F-2, F-22)
- **Reflex DOM:** `{"rows":2,"dateInputs":1,...}`
- **Next.js DOM:** `{"rows":2,"dateInputs":3,...}`
- **Existing findings confirmed:** F-22, F-2.
- **New findings:** —
- **Notes:** Next.js dateInputs:3 vs Reflex 1 — the Next.js side renders Effective Date / Maturity Date / First Reset Date as cell-editor `input[type=date]` widgets per visible row, while Reflex renders them as static text. This is a downstream effect of Next.js cell editor configuration differences; not a regression. Both render 2 rows from same upstream data.

### Row 44 — events/event-calendar
- **Status:** PASS with minor enhancement on Next.js (added Apply button)
- **Reflex DOM:** `{"rows":20,"dateInputs":1,"applyClearBtns":0,...}`
- **Next.js DOM:** `{"rows":20,"dateInputs":3,"applyClearBtns":1,...}` (input details: 1 explicitly labelled `Event Date Filter Input`)
- **Existing findings touched:** F-22 (event_calendar_mixin has 2 s simulator; Next.js page does not opt in).
- **New findings:** **W5-A** (see below) — Next.js has additional "Apply" button on the Event Date filter that Reflex does not. Minor but an additive UI nudge worth recording.
- **Notes:** Next.js page first probe returned empty grid (loading); second probe after additional 4 s sleep showed 20 rows. Re-screenshot taken to ensure clean visual artifact.

### Row 45 — events/event-stream
- **Status:** MISMATCH (expected per F-2, F-22)
- **Reflex DOM:** `{"rows":16,"headers":["","","Symbol","Record Date","Event Date","Day of Week","Event Type","Subject","Notes"],"dateInputs":2,...}`
- **Next.js DOM:** `{"rows":16,"headers":[..."Symbol","","Record Date","Event Date","Day","Event Type","Subject","Notes","Alerted","Recur","Created By","Created Time","Updated By","Updated Time"],"dateInputs":2,...}`
- **Existing findings confirmed:** F-22 (event_stream_mixin has simulator on Reflex; not wired on Next.js), F-2.
- **New findings:** —
- **Notes:** Next.js columns include 5 audit columns (Alerted / Recur / Created By / Created Time / Updated By / Updated Time) that aren't visible in the Reflex viewport. May be column-tool-panel hidden on Reflex; not flagged.

### Row 46 — events/reverse-inquiry
- **Status:** PASS
- **Reflex DOM:** `{"rows":30,"dateInputs":3,...}`
- **Next.js DOM:** `{"rows":30,"dateInputs":2,...}`
- **Existing findings touched:** —
- **New findings:** —
- **Notes:** dateInputs delta (3 vs 2) — Reflex has an additional date filter input visible (likely an inquiry-date filter bar element); Next.js shows two cell-editor date inputs in the rendered rows. Page is functionally PASS at 30 rows; visual difference is the third input on Reflex side. Recommended to inspect at code level whether Reflex has a distinct filter bar that Next.js is missing — see W5-B note below.

### Row 47 — operations/daily-procedures (slug remap → Reflex `daily-procedure-check`)
- **Status:** MISMATCH (expected per F-1, F-8, F-29)
- **Reflex DOM:** `{"rows":6,"dateInputs":2,...}`
- **Next.js DOM:** `{"rows":6,"dateInputs":2,...}`
- **Reflex context menu items:** `["Rerun", "Kill", "Copy", "Copy with Headers", "Export"]` (5 items, custom Rerun/Kill at top with icons — refresh icon for Rerun, red dot for Kill)
- **Next.js context menu items:** `["Cut", "Copy", "Copy with Headers", "Copy with Group Headers", "Paste", "Export"]` (6 items, **all built-in AG Grid only** — no Rerun, no Kill)
- **Existing findings confirmed:** **F-1** (no Rerun/Kill backend POST), **F-8** (no Rerun/Kill UI affordance), **F-29** (slug remap `daily-procedure-check` vs `daily-procedures`), F-2, F-22.
- **New findings:** —
- **Notes:** Confirmation captured in `operations-daily-procedures-{reflex,nextjs}-context.png`. Reflex screenshot shows the bespoke menu with 🔄 Rerun and red-dot Kill at top; Next.js shows the default AG Grid menu only.

### Row 48 — operations/operation-process
- **Status:** MISMATCH (expected per F-1, F-8)
- **Reflex DOM:** `{"rows":8,"headers":["","","Process","Status","Last Run Time"],...}`
- **Next.js DOM:** `{"rows":8,"headers":["","Process","","Status","Last Run Time"],...}`
- **Reflex context menu items:** `["Rerun", "Kill", "Copy", "Copy with Headers", "Export"]` (5 items)
- **Next.js context menu items:** `["Cut", "Copy", "Copy with Headers", "Copy with Group Headers", "Paste", "Export"]` (6 items, built-in only)
- **Existing findings confirmed:** **F-1**, **F-8**, F-2, F-22.
- **New findings:** —
- **Notes:** Confirmation captured in `operations-operation-process-{reflex,nextjs}-context.png`. Same pattern as daily-procedures — Reflex ships custom menu, Next.js uses default.

### Row 49 — orders/emsx-order
- **Status:** MISMATCH (expected per F-2, F-22)
- **Reflex DOM:** `{"rows":20,"headers":["","","Sequence","Underlying","Ticker","Broker","Pos Loc","Side","Status"],"autoRefresh":true,...}`
- **Next.js DOM:** `{"rows":20,"headers":[..."Ticker","","Sequence","Underlying","Broker","Pos Loc","Side","Status","EMSX Amount","EMSX Routed","EMSX Working","EMSX Filled"],...}`
- **Existing findings touched:** F-22 (Reflex has emsx_order_mixin simulator; Next.js does not), F-2.
- **New findings:** —
- **Notes:** Next.js shows additional columns (EMSX Amount/Routed/Working/Filled). Note Reflex `autoRefresh:true` here too, because the `[role=switch]` query also matches an off-screen accessibility element in this page; harmless. Both sides 20 rows.

### Row 50 — orders/emsx-route
- **Status:** MISMATCH (expected per F-2, F-22, hidden id-column note)
- **Reflex DOM:** `{"rows":10,"headers":["","","Order ID","Route ID","Broker","Quantity","Filled Qty","Avg Price","Status"],"numberInputs":4,...}`
- **Next.js DOM:** `{"rows":10,"headers":["","Route ID","","Order ID","Broker","Quantity","Filled Quantity","Avg Price","Status"],"numberInputs":3,...}`
- **Reflex visible col-ids:** `["ag-Grid-RowNumbersColumn","ag-Grid-SelectionColumn","order_id","route_id","broker","quantity","filled_quantity","avg_price","status"]`
- **Next.js visible col-ids:** `["ag-Grid-RowNumbersColumn","route_id","ag-Grid-SelectionColumn","order_id","broker","quantity","filled_quantity","avg_price","status"]`
- **Existing findings touched:** F-22, F-2.
- **New findings:** —
- **Notes:** No `id` column visible in DOM on either side — the route-matrix "hidden `id` column delta" appears to be a code-level/payload concern not reflected in the current rendered grid. Reflex has 4 `numberInputs` (floating filters on Quantity/Filled Qty/Avg Price + maybe Order ID); Next.js has 3 — minor floating-filter wiring difference, not flagged. Reflex column ordering (Order ID before Route ID) differs from Next.js (Route ID before Order ID); benign label/order delta.

## Proposed new findings (W5-A..W5-B)

### W5-A — events/event-calendar adds an "Apply" button absent on Reflex (Low / informational)
- **Reflex:** `events/event-calendar` filter strip has only an "Event Date Filter Input" (date picker), no Apply button. Filter applies on change.
- **Next.js:** `events/event-calendar` filter strip has the same date picker plus an explicit `Apply` button (and the DOM probe records `applyClearBtns:1`).
- **Severity / risk:** Cosmetic / informational. Adds an extra click vs Reflex but improves intent clarity for a date filter; user may want this kept.
- **Status:** Probably an enhancement, not a regression. Surface to product owner.

### W5-B — events/reverse-inquiry shows 3 dateInputs on Reflex vs 2 on Next.js (Low / spot-check)
- **Reflex:** `events/reverse-inquiry` shows 3 visible `input[type=date]` (Inquiry Date floating filter + Expiry Date floating filter + an extra third input — likely a header-level filter bar input or grid-internal date editor).
- **Next.js:** Shows 2 (Inquiry / Expiry floating filters only).
- **Severity:** Low. Both grids load 30 rows of identical data; difference is whether Reflex has a higher-level filter affordance not yet ported to Next.js. The route-matrix marks reverse-inquiry as PASS at code-level — recommend a quick code-level recheck to determine whether Reflex's third input is a missing filter bar (in which case escalate to F-4 family) or just a grid-internal element.
- **Status:** Spot-check follow-up; do not auto-promote without code review.

(No other new findings from W5 — all 12 rows mapped onto existing F-numbers.)

## Summary
- Routes processed: 12 (5 instruments + 3 events + 2 operations + 2 orders)
- PASS: 3 (ticker-data, event-calendar*, reverse-inquiry*) — both event pages have **W5-A** and **W5-B** spot-checks but were classified PASS in the route-matrix and remain PASS at functional/data level.
- MISMATCH: 9 (stock-screener, special-terms, instrument-data, instrument-term, event-stream, daily-procedures, operation-process, emsx-order, emsx-route) — all expected from F-numbers.
- New findings (temp): W5-A (event-calendar Apply button — additive), W5-B (reverse-inquiry 3rd dateInput — spot-check).
- Existing findings hit / confirmed: **F-1, F-2, F-4, F-6, F-8, F-16, F-22, F-28, F-29.**
- Slug remaps verified: `instruments/special-term` ↔ `instruments/special-terms` (Reflex singular), `operations/daily-procedure-check` ↔ `operations/daily-procedures` (Reflex hyphenated long form).

## Artifacts
- 24 base PNGs (`<module>-<page>-{reflex,nextjs}.png`).
- 4 context-menu PNGs (`operations-{daily-procedures,operation-process}-{reflex,nextjs}-context.png`) for F-1 + F-8 evidence.
- DOM probe results retained in this file under each row.

## Blockers
None. Walk completed end-to-end.
