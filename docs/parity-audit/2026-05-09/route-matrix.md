# PMT Parity Audit — Route Matrix (2026-05-09 audit + 2026-05-10 walk)

Reflex (`:3001/pmt/`) is the spec. 50 routes derived from
`nextjs-frontend/lib/constants.ts`. Statuses below come from the
2026-05-09 code-level audit refined by the 2026-05-10 full per-route
browser walk (5 parallel agents, 1440×900 viewport, both bypass flags
ON). See [`findings.md`](./findings.md) for cited Reflex/Next.js source
references and severity tags. Per-row evidence (DOM probes,
screenshots, interactive probe results) lives under
[`artifacts/walk-W{1..5}/`](./artifacts/).

Status legend:
- **PASS** — code-level wiring matches Reflex and browser snapshot is
  feature-equivalent. Cosmetic-only deltas (column ordering, label
  capitalisation, additive Next.js columns) annotated but not enough to
  fail.
- **MISMATCH** — code-level deviates from Reflex (column / filter /
  cadence / interaction) at one or more points. Each row points to one
  or more finding IDs.
- **BLOCKED** — page won't render due to backend/route gap (none).

Current state note: this table is an audit snapshot from 2026-05-09
and 2026-05-10. Milestone B/C implementation work is now closed through
HEAD `82142c9`; F-7, F-21, F-23, F-35, and F-36 are closed. F-9,
F-27, F-28, and AG Grid Enterprise license procurement remain
intentional out-of-scope deltas unless reprioritized.

| # | Module | Subtab | Browser parity | Code parity | Findings | Walk evidence |
|---|---|---|---|---|---|---|
| 1 | market-data | market-data | PASS | PASS | F-2 (overridden, OK) | walk-W1 |
| 2 | market-data | fx-data | PASS | PASS | F-2 (overridden, OK) | walk-W1 |
| 3 | market-data | ticker-data (Reference Data) | MISMATCH | MISMATCH | F-13/F-29 (slug remap), F-2/F-22, **F-30** (auto-refresh switch on calm page) | walk-W1 |
| 4 | market-data | historical-data | MISMATCH | MISMATCH | F-3 (no filter bar; Reflex ticker multi-select + date range), F-2 (5 s mixin) | walk-W1 |
| 5 | market-data | trading-calendar | MISMATCH | MISMATCH | F-3 (date-range filter bar missing), **F-30** | walk-W1 |
| 6 | market-data | market-hours | PASS | PASS | **F-30** (auto-refresh switch on a static page) | walk-W1 |
| 7 | positions | positions | PASS | PASS | F-5 wishlist (rowIdKey) | walk-W1 |
| 8 | positions | stock-position | PASS | PASS | — (W1 verified Reflex position-date strip uses `<input type="text">`; dateInputs heuristic was over-flagging) | walk-W1 |
| 9 | positions | warrant-position | PASS | PASS | — | walk-W1 |
| 10 | positions | bond-positions | PASS | PASS | — | walk-W1 |
| 11 | positions | trade-summary | PASS | PASS | Next.js ships richer From/To filter than Reflex; not flagged | walk-W1 |
| 12 | pnl | pnl-change | MISMATCH | MISMATCH | **F-3**, F-5, F-12 (col-level), F-2/F-22 (20 vs 0 cell flashes in 5 s) | walk-W2 |
| 13 | pnl | pnl-summary | MISMATCH | MISMATCH | **F-3**, F-5 (rowIdKey="underlying"), F-12 (col-level) | walk-W2 |
| 14 | pnl | pnl-currency | MISMATCH | MISMATCH | **F-3**, F-5 (rowIdKey="currency"), F-12 (col-level), F-2/F-22 | walk-W2 |
| 15 | pnl | pnl-full | MISMATCH | MISMATCH | **F-3**, F-5 (rowIdKey="ticker"), F-12 (col-level), F-2/F-22 | walk-W2 |
| 16 | risk | delta-change | MISMATCH | MISMATCH | F-2/F-22, **F-31** (risk pages need position-date filter) | walk-W2 |
| 17 | risk | risk-measures | MISMATCH | MISMATCH | F-2/F-22, **F-31** | walk-W2 |
| 18 | risk | risk-inputs | MISMATCH | MISMATCH | F-2/F-22 (code-level only — no filter bar on either side, expected) | walk-W2 |
| 19 | risk | pricer-warrant | MISMATCH | MISMATCH | F-9, **F-32** (Pricing Results table missing), **F-33** (Notes truncated 5/8) | walk-W2 |
| 20 | risk | pricer-bond | MISMATCH | MISMATCH | F-9, **F-11** (Pricing Results table missing), **F-10 (rev)** (Notes section absent entirely) | walk-W2 |
| 21 | recon | pps-recon | PASS | PASS | **F-30** (auto-refresh switch on force-refresh page) | walk-W3 |
| 22 | recon | settlement-recon | PASS | PASS | **F-30** | walk-W3 |
| 23 | recon | failed-trades | PASS | PASS | **F-30** | walk-W3 |
| 24 | recon | pnl-recon | PASS | PASS | **F-30** | walk-W3 |
| 25 | recon | risk-input-recon | PASS | PASS | **F-30** | walk-W3 |
| 26 | compliance | restricted-list | MISMATCH | MISMATCH | F-12 (panel hidden), **F-30** | walk-W3 |
| 27 | compliance | undertakings | MISMATCH | MISMATCH | **F-15** (backend ignores `position_date`), F-12, **F-30** | walk-W3 |
| 28 | compliance | beneficial-ownership | MISMATCH | MISMATCH | F-12, **F-34** (Next.js renders date-range bar; Reflex single-date), **F-30** | walk-W3 |
| 29 | compliance | monthly-exercise-limit | MISMATCH | MISMATCH | F-12, **F-30** | walk-W3 |
| 30 | portfolio-tools | pay-to-hold | MISMATCH | MISMATCH | **F-4**, F-2/F-22, **F-35** (+6 columns), **F-30** | walk-W4 |
| 31 | portfolio-tools | stock-borrow | MISMATCH | MISMATCH | F-2/F-22, **F-35** (+1), **F-36** (`JPM Req`), **F-30** | walk-W4 |
| 32 | portfolio-tools | reset-dates | MISMATCH | MISMATCH | F-2/F-22, **F-7** (multi-field bar), **F-35** (+5, incl. `market_price`), **F-36**, **F-30** | walk-W4 |
| 33 | portfolio-tools | coming-resets | MISMATCH | MISMATCH | F-2/F-22, **F-35** (+2), **F-36** (`Announce Date`), **F-30** | walk-W4 |
| 34 | portfolio-tools | cb-installments | MISMATCH | MISMATCH | **F-4**, F-2/F-22, **F-35** (+4), **F-36**, **F-30** | walk-W4 |
| 35 | portfolio-tools | excess-amount | MISMATCH | MISMATCH | **F-4** (no toolbar date AND no filter bar — `dateInputs:0`), F-2/F-22, **F-35** (+2), **F-36**, **F-30** | walk-W4 |
| 36 | portfolio-tools | deal-indication | MISMATCH | MISMATCH | F-2/F-22, **F-35** (+4), **F-30** | walk-W4 |
| 37 | portfolio-tools | po-settlement | MISMATCH | MISMATCH | F-2/F-22, **F-35** (+4); filter bar wired ✓ | walk-W4 |
| 38 | portfolio-tools | short-ecl | MISMATCH | MISMATCH | F-2/F-22, **F-35** (+3), **F-30** | walk-W4 |
| 39 | instruments | ticker-data | MISMATCH | MISMATCH | F-2/F-22, F-28 (Next.js ahead of Reflex), **F-30** | walk-W5 |
| 40 | instruments | stock-screener | MISMATCH | MISMATCH | F-2/F-22, **F-6** (DTL10 / Market Cap / ADV 3M / Country bar absent — Reflex 9 number inputs + Apply, Next.js 0) | walk-W5 |
| 41 | instruments | special-terms | MISMATCH | MISMATCH | **F-16** (backend ignores `pos_date`), **F-4** (filter bar missing), F-2/F-22, F-29 (slug remap) | walk-W5 |
| 42 | instruments | instrument-data | MISMATCH | MISMATCH | F-2/F-22 | walk-W5 |
| 43 | instruments | instrument-term | MISMATCH | MISMATCH | F-2/F-22 (Next.js dateInputs:3 vs Reflex 1 is a cell-editor-vs-text-render artifact, not a regression) | walk-W5 |
| 44 | events | event-calendar | PASS | PASS | F-22 (mixin has 2 s simulator), **F-37** (Next.js adds Apply button absent on Reflex — additive) | walk-W5 |
| 45 | events | event-stream | MISMATCH | MISMATCH | F-2 (event_stream mixin 2 s), F-22 | walk-W5 |
| 46 | events | reverse-inquiry | PASS | PASS | **F-38** (3 vs 2 dateInputs — spot-check follow-up; not a regression at code level) | walk-W5 |
| 47 | operations | daily-procedures | MISMATCH | MISMATCH | **F-1** (no Rerun/Kill backend POST), **F-8** (no context-menu UI; visual confirm in `*-context.png`), F-2, F-29 (slug remap) | walk-W5 |
| 48 | operations | operation-process | MISMATCH | MISMATCH | **F-1**, **F-8**, F-2 | walk-W5 |
| 49 | orders | emsx-order | MISMATCH | MISMATCH | F-2 (2 s mixin), F-22 | walk-W5 |
| 50 | orders | emsx-route | MISMATCH | MISMATCH | F-2, F-22; "hidden `id` column delta" in original audit not visible at DOM level — code-level concern only | walk-W5 |

## Coverage summary (post-walk)

- **PASS rows: 16 / 50**: market-data/{market-data, fx-data,
  market-hours}, positions/{all five}, recon/{all five},
  events/{event-calendar, reverse-inquiry}.
- **MISMATCH rows: 34 / 50**: every other row, each carrying ≥ 1
  finding ID. Zero `NOT TESTED` rows — full walk complete.
- **Browser walks performed: 50 / 50** (W1=11, W2=9, W3=9, W4=9, W5=12).
- **Screenshots: 100 PNGs** (50 reflex + 50 nextjs) plus 4 Operations
  context-menu screenshots (`*-context.png`) under
  [`artifacts/walk-W{1..5}/`](./artifacts/).
- **DOM probes**: per-route JSON in each agent's `notes.md`.

## Walk methodology corrections

The brief's DOM probe needed three corrections during the walk; future
walks should use the corrected probes:

1. **AG Grid column virtualisation under-reports headers** (W1).
   `.ag-header-cell-text` only returns columns inside
   `.ag-center-cols-viewport`. To get full column parity, scroll the
   viewport in 1/3-viewport increments and dedup-collect `[col-id]` +
   header text into a `Map`. Failing to do this can falsely flag a
   missing column when the column is just off-screen.
2. **Reflex position-date strips render as `<input type="text">`**
   (W1). Reflex uses a custom calendar widget over a text input, so
   the `input[type="date"]` heuristic over-flags every page that has a
   real Reflex filter bar. Cross-check by inspecting the full inputs
   list before raising a "filter bar missing" finding.
3. **Row-group panel detection needs visibility filter** (W3). AG Grid
   Enterprise emits `.ag-column-drop-horizontal` (and
   `.ag-row-group-panel`) divs unconditionally and tags them
   `ag-hidden` when `rowGroupPanelShow !== 'always'`. The reliable
   probe is `:not(.ag-hidden)[offsetHeight > 0]` — without that filter
   the probe returns true on every page and false-passes F-12.

The corrected probes are captured in
[`artifacts/walk-W3/notes.md`](./artifacts/walk-W3/notes.md).

## Slug mismatch summary (notification deep-link risk)

Three pages diverge — the Next.js notification sidebar slugifier in
`lib/notification-routes.ts` resolves the first via subtab-label
match, but the latter two fall through and 404. Closed by **F-29**.

| Reflex URL | Next.js URL | Resolution |
|---|---|---|
| `/market-data/reference-data` | `/dashboard/market-data/ticker-data` | ✓ matches via label `Reference Data` |
| `/instruments/special-term` | `/dashboard/instruments/special-terms` | ✗ falls through to `/dashboard/instruments/special-term` (404) |
| `/operations/daily-procedure-check` | `/dashboard/operations/daily-procedures` | ✗ falls through (404) |

## "Next.js ahead of Reflex" cross-cutting observation

Across pnl/risk/portfolio-tools/instruments/events/orders the Next.js
side exposes 1-6 additional columns vs Reflex's default visible set
(captured per-row above and aggregated in **F-35**). The pattern is
consistent: Next.js ships everything in `pmt_core` columndefs; Reflex
hides extras by default. As of implementation HEAD `82142c9`,
documented Next.js read-only column supersets are intentional
enhancements over older Reflex hide lists unless a page-specific audit
item says otherwise. See **F-35** in findings.md.
