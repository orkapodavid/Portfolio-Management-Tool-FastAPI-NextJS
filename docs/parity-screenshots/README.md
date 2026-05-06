# Parity Screenshots — Reflex (`:3001`) ↔ Next.js (`:3000`)

This directory captures §11 exit criterion #12 from the
2026-05-05 handoff brief plus §10 #5 from the 2026-05-07 grid +
chrome runtime feature-parity brief: side-by-side proof that the
canonical landing page in each of the 11 modules in `lib/constants.ts`
renders the same data, the same toolbar / status bar / filter chrome,
and the same grid runtime features (Excel export, layout
persistence, range selection, row numbers, multi-select, cell flash,
auto-refresh, notification jump) on the Next.js implementation as it
does on the Reflex reference.

## Capture environment

Re-captured 2026-05-11 at 1440×900 viewport via `playwright-cli`
after the Milestone C gate-close pass. All 22 canonical PNGs
were re-shot against implementation HEAD `82142c9`:

| Service  | Port | Flags |
|---|---|---|
| FastAPI backend | 8000 | `DATABASE_URL=sqlite+aiosqlite:///…/.pmt-dev.sqlite3` |
| Next.js dev | 3000 | `pnpm dev` |
| Reflex reference | 3001 | `uv run reflex run` (defaults) |

The local defaults allow incognito-page parity comparison without
logging in. Set `PMT_AUTH_DISABLED=false` and
`NEXT_PUBLIC_AUTH_DISABLED=0` to exercise authenticated JWT flows.

AG Grid Enterprise is now installed on the Next.js side
(`ag-grid-enterprise@35.0.1`). Without an Enterprise license key the
console prints a "License Key Not Found — All AG Grid Enterprise
features are unlocked for trial" warning; Reflex runs in the same
state. Procuring a license is out of scope.

F-27 mobile responsive nav and F-28 Reflex ticker-data divergence are
also intentional out-of-scope deltas for this pass unless explicitly
reprioritized.

## What's covered

22 PNGs total — one Reflex + one Next.js per module:

| Module | Page | Files |
|---|---|---|
| `market-data` | `market-data` | `market-data/market-data-{reflex,nextjs}.png` |
| `positions` | `positions` | `positions/positions-{reflex,nextjs}.png` |
| `pnl` | `pnl-change` | `pnl/pnl-change-{reflex,nextjs}.png` |
| `risk` | `delta-change` | `risk/delta-change-{reflex,nextjs}.png` |
| `recon` | `pps-recon` | `recon/pps-recon-{reflex,nextjs}.png` |
| `compliance` | `restricted-list` | `compliance/restricted-list-{reflex,nextjs}.png` |
| `portfolio-tools` | `pay-to-hold` | `portfolio-tools/pay-to-hold-{reflex,nextjs}.png` |
| `instruments` | `ticker-data` | `instruments/ticker-data-{reflex,nextjs}.png` |
| `events` | `event-calendar` | `events/event-calendar-{reflex,nextjs}.png` |
| `operations` | `daily-procedures` | `operations/daily-procedures-{reflex,nextjs}.png` |
| `orders` | `emsx-order` | `orders/emsx-order-{reflex,nextjs}.png` |

Motion artifacts for the UX that cannot be proven in still frames:

| Scenario | Files |
|---|---|
| Market Data live flash cadence | `market-data/market-data-{reflex,nextjs}-flash.webm` |
| Next.js notification cross-page jump | `notification-jump.webm` |

## What now matches (closed in 2026-05-07 pass)

The 2026-05-06 captures had visible deltas where the Next.js shell
was missing toolbar / status-bar / grid-runtime features. After the
feature-parity pass those have been closed:

- **Excel export button** (timestamped `<page>_YYYYMMDD_HHMM.xlsx`,
  selection-aware via `shouldRowBeSkipped`).
- **Save / Restore / Reset Layout** trio — column widths, sort, and
  filter state persist under `pmt:next:<grid_id>_state`. Auto-restores
  on `gridReady`.
- **Compact mode toggle** — toggles row/header from 42/48 to 28/32 and
  calls `autoSizeAllColumns` on enter / `sizeColumnsToFit` on exit
  (matches Reflex pixel-faithfully per user-confirmed scope).
- **Auto Refresh switch + Last Updated timestamp + live pulse**.
- **Search clear (✕)** appears when search has a value.
- **Status bar** — `agTotal / agFiltered / agSelected / agAggregation`
  panels at the bottom.
- **Range selection** (`cellSelection`) — click-and-drag cell ranges.
- **Cell flash** on value change (`enableCellChangeFlash` on the
  default col def for live grids).
- **Row numbers** column on the left of every grid.
- **Multi-row selection** with header + row checkboxes.
- **Custom context menu** prop (right-click, e.g. Operations rerun /
  kill — pages opt-in by passing `getContextMenuItems`).
- **Toolbar date picker** (single date) — pages opt-in via
  `toolbarDate` / `onToolbarDateChange`.
- **Generate dropdown** (page-passed items + handler).
- **Page-specific filter bars** (single-date / date-range with
  Apply / Clear) — wired on `compliance/monthly-exercise-limit`,
  `portfolio-tools/po-settlement`, `positions/positions`,
  `recon/pps-recon`, `recon/settlement-recon`. The remaining routes
  that already accept `position_date` / `trade_date` query params
  follow the same template and can be mass-applied; see
  `components/grid/filter-bar.tsx` for the three exports.
- **Notification jump-to-row** — clicking a notification's "go to
  details" arrow (`ArrowRight` icon) scrolls + flash-highlights the
  matching grid row, via the new `GridRegistryProvider` mounted in
  `app/dashboard/layout.tsx`.

## What now matches (closed in 2026-05-08 flash/jump pass)

- **Market Data / FX live cadence** — the Next.js grid wrapper keeps
  backend polling on its 30 s default while opt-in page simulators
  mutate 1-5 rows every 2 s, matching Reflex's client-side
  `simulate_*_update` mixins and driving AG Grid cell flash.
- **Cross-page notification jump** — the sidebar now resolves
  `module` + `subtab` through `lib/constants.ts`, stores
  `pmt:next:pendingHighlight` in `sessionStorage` when the target
  grid is not mounted, then lets `GridRegistryProvider` pick it up on
  grid registration and retry through async row loading.
- **Sticky notification highlight** — the row highlight is re-applied
  every 200 ms for 1.8 s so AG Grid virtualization, scrolling, or row
  DOM replacement cannot drop it early. The sticky highlight colour now
  mirrors Reflex's blue/purple `.notification-highlight`; AG Grid's
  default yellow cell flash is unchanged.
- **Payload row-id keys** — notification jumps use the payload's grid
  row-id key (`ticker`, `currency`, `underlying`, etc.) as an override
  when matching rows, so notifications still work on pages whose
  DataGrid row identity falls back to `id`.

## What now matches (closed in 2026-05-11 Milestone C pass)

- **Search typing feel** — grid quick-filter updates are debounced by
  300 ms, matching Reflex's less jumpy search behaviour.
- **Pending notification jumps** — cross-page pending highlights retry
  for 15 s while async row data settles.
- **Calm pages** — non-live Recon, Compliance, Instrument, and
  Market Data reference pages no longer show the Auto Refresh chrome.
- **Row grouping** — PnL and Compliance grids expose the row-group
  panel and column grouping metadata Reflex users expect.
- **Reverse Inquiry filter bar** — the page now has its Reflex
  Position Date filter.
- **Reset Dates filter bar** — ticker, start/end date, frequency,
  reset month/day, and up/down filters are wired through FastAPI and
  the generated OpenAPI client.
- **Chrome polish** — notification entry animation, subtab overflow,
  and toolbar date-input styling align more closely with Reflex.
- **Notification sidebar default** — the sidebar defaults open like
  Reflex and persists explicit user toggles under
  `pmt:next:notificationSidebarOpen`.
- **Notification infinite scroll** — the sidebar fetches a bounded
  notification set and renders 20 cards initially, with the same
  scroll-sentinel / fallback load-more pattern Reflex uses.
- **Portfolio Tools labels** — abbreviated headers called out in F-36
  now use the longer Reflex labels.
- **Pricer detail** — pricer result tables and full note copy are back
  on Warrant and Bond pricer pages; the out-of-scope Plotly 3-D chart
  remains intentionally deferred.
- **Stock Screener filters** — the Reflex-style filter bar is present
  with client-side filtering while the generated OpenAPI client still
  exposes no server query params for that route.

## Expected deltas (intentional, not regressions)

The two implementations don't pixel-match and aren't intended to.
Reviewers should expect:

### Top-level chrome
- **Top nav**: same dark `#333333` background, same uppercase 9 px
  module labels, same lucide-react icons. Reflex's avatar dropdown
  is hidden in local no-auth mode so the Next.js shell does not render
  a user widget where Reflex shows one.
- **Performance header**: both render the four KPI sparklines (Total
  NAV, Daily P&L, YTD Return, Net Exposure) and the three currency
  strips (Total Value, Daily Change, Total O/L). The "Show Top Movers"
  reveal button is collapsed in the captures on both sides.
- **Notification bell**: reflex renders an opaque tan icon, Next.js a
  lucide bell with a numeric badge. Same `/api/notifications/`
  endpoint, same unread-count behaviour, same "go to details" jump.
- **Subtab nav**: same labels, same active-tab blue underline + bold
  styling. Hover state isn't visible in static captures.
- **Notification sidebar default state**: both Reflex and Next.js now
  open the notification sidebar by default. Next.js preserves explicit
  user toggles in `pmt:next:notificationSidebarOpen`, so a browser
  profile that previously collapsed it will keep that preference.

### Grids
- **Auto Refresh switch state**: both Reflex and Next.js now default
  Auto Refresh ON (Reflex initialises `<module>_auto_refresh: bool =
  True` in each mixin; Next.js sets the wrapper-level default to true
  whenever `showAutoRefresh` is set). The emerald pulse animates and
  Last Updated populates immediately on first load.
- **Canonical headers, order, alignment, filter types** match — both
  use the same `pmt_core` data shapes. Pinned `ticker` columns appear
  on the left in both.
- **Next.js column supersets** are intentional where present. The
  Next.js rebuild exposes additional read-only `pmt_core` fields on
  some PnL, Risk, Portfolio Tools, Instruments, Events, and Orders
  grids; Reflex's default hide lists are older and narrower. Treat
  those supersets as an enhancement unless a page-specific audit item
  says otherwise.
- **Row heights** are within ~5 px (both apps default to the AG Grid
  Quartz theme on port 3001 / 3000 respectively).
- **Column auto-fit**: Reflex and Next.js both stretch the rightmost
  column to fill via `flex: 1` on the default col def.
- **Floating filter row** is always visible on both sides.

### Trial license watermark / dev overlay
- Reflex and Next.js both run AG Grid Enterprise without a license
  key. The console shows a trial-license warning on both. Reflex's
  shell doesn't render a watermark in the captures because the
  notification sidebar covers the bottom-right corner; Next.js's
  shell may show a watermark depending on viewport. Procuring a
  trial / production AG Grid Enterprise license key is the fix.
- The "14 Issues" red badge in the bottom-left of Next.js captures is
  the Next 16 dev overlay; it disappears in `pnpm build`. The "issues"
  here are AG Grid's trial-license console errors, not real defects.

### Pages with intentional deltas

These pages were converged in earlier sessions but have known shape
differences documented below. They still match feature-for-feature:

- **`compliance/beneficial-ownership`** (not a canonical landing page;
  not in the 11 captures) — was rendered with empty cells before the
  2026-05-06 session because the FastAPI handler returned a
  `ComplianceRecord` shape rather than the canonical
  `BeneficialOwnershipRecord`. Track 1 of 2026-05-06 added the new
  TypedDict and rewrote the mock; the grid now matches Reflex.
- **`risk/pricer-warrant`, `risk/pricer-bond`** (not in the 11) —
  scaffolded as full forms in 2026-05-06 (Track 3, full calculator
  port). The chart on the Next.js side is an inline-SVG payoff /
  yield curve; the Reflex side renders a 3D Plotly surface, so the
  chart visuals will not pixel-match. Numeric outputs match because
  both wrap the same `pmt_core.services.pricing.{WarrantPricer,
  BondPricer}`.

### Empty-grid pages

`operations/daily-procedures` returns an empty mock list on both
sides (`pmt_core.services.operations` ships no records by default),
so both captures show the empty-state message rather than data rows.
This is a parity match in the trivial sense; populate the mock if
you need a data-bearing comparison.

## Reproduction

```bash
# Start the three services in default local no-auth mode
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

cd ../nextjs-frontend
pnpm dev    # → :3000

cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → :3001/pmt/

# Capture (two sessions, 1440×900)
playwright-cli -s=reflex open --browser=chrome
playwright-cli -s=reflex resize 1440 900
playwright-cli -s=reflex goto http://localhost:3001/pmt/<module>/<page>
playwright-cli -s=reflex screenshot --filename=…-reflex.png

playwright-cli -s=nextjs open --browser=chrome
playwright-cli -s=nextjs resize 1440 900
playwright-cli -s=nextjs goto http://localhost:3000/dashboard/<module>/<page>
playwright-cli -s=nextjs screenshot --filename=…-nextjs.png
```

The 11 canonical landing pages are the first subtab in each module's
`subtabs` array in `nextjs-frontend/lib/constants.ts`.
