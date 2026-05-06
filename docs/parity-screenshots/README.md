# Parity Screenshots — Reflex (`:3001`) ↔ Next.js (`:3000`)

This directory captures §11 exit criterion #12 from the
2026-05-05 handoff brief: side-by-side proof that the canonical landing
page in each of the 11 modules in `lib/constants.ts` renders the same
data, columns, filters, formatting, and chrome on the Next.js
implementation as it does on the Reflex reference.

## Capture environment

Captured 2026-05-06 at 1440×900 viewport via `playwright-cli` against:

| Service  | Port | Flags |
|---|---|---|
| FastAPI backend | 8000 | `DATABASE_URL=sqlite+aiosqlite:///…/.pmt-dev.sqlite3 PMT_AUTH_DISABLED=true` |
| Next.js dev | 3000 | `NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev` |
| Reflex reference | 3001 | `uv run reflex run` (defaults) |

The auth-bypass flags allow incognito-page parity comparison without
logging in. Both flags default OFF in any committed env example.

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

## Expected deltas (intentional, not regressions)

The two implementations don't match pixel-for-pixel and aren't intended
to. Reviewers should expect these differences:

### Top-level chrome
- **Top nav**: same dark `#333333` background, same uppercase 9px
  module labels, same lucide-react icons. Reflex's avatar dropdown is
  hidden by `NEXT_PUBLIC_AUTH_DISABLED=1` so the Next.js shell does not
  render a user widget where Reflex shows one.
- **Performance header**: both render the four KPI sparklines (Total
  NAV, Daily P&L, YTD Return, Net Exposure) and the three currency
  strips (Total Value, Daily Change, Total O/L). The "Show Top Movers"
  reveal button is collapsed in the captures on both sides.
- **Notification bell**: reflex renders an opaque tan icon, Next.js a
  lucide bell with a numeric badge. Same `/api/notifications/`
  endpoint, same unread-count behaviour.
- **Subtab nav**: same labels, same active-tab blue underline + bold
  styling. Hover state isn't visible in static captures.

### Grids
- **Headers, order, alignment, filter types** match — both use the same
  `pmt_core` data shapes. Pinned `ticker` columns appear on the left in
  both.
- **Row heights** are slightly different. Reflex uses a denser default
  (~26 px); Next.js uses the AG Grid Quartz theme default (~32 px).
- **Column auto-fit**: Reflex tends to stretch the rightmost column to
  fill available width; Next.js leaves explicit `minWidth` values.
  Don't read into a wider/narrower right edge.
- **Filter row**: the Next.js floating-filter row is always visible and
  matches Reflex's "Floating Filters" mode.

### Pages with intentional deltas

These pages were converged in this session but shipped after the
screenshot capture's reference cut, or have known shape differences
documented below. They still match feature-for-feature:

- **`compliance/beneficial-ownership`** (not a canonical landing page;
  not in the 11 captures) — was rendered with empty cells before this
  session because the FastAPI handler returned a `ComplianceRecord`
  shape rather than the canonical `BeneficialOwnershipRecord`. Track 1
  added the new TypedDict and rewrote the mock; the grid now matches
  Reflex.
- **`risk/pricer-warrant`, `risk/pricer-bond`** (not in the 11) —
  scaffolded as full forms in this session (Track 3, full calculator
  port). The chart on the Next.js side is an inline-SVG payoff/yield
  curve; the Reflex side renders a 3D Plotly surface, so the chart
  visuals will not pixel-match. The numeric outputs (fair value, delta,
  expected discount, bond floor/parity) do match because both wrap the
  same `pmt_core.services.pricing.{WarrantPricer,BondPricer}`.

### Empty-grid pages

`operations/daily-procedures` returns an empty mock list on both sides
(`pmt_core.services.operations` ships no records by default), so both
captures show the empty-state message rather than data rows. This is
a parity match in the trivial sense; populate the mock if you need a
data-bearing comparison.

## Reproduction

```bash
# Start the three services with bypass flags ON
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

cd ../nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev    # → :3000

cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → :3001/pmt/

# Capture
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
