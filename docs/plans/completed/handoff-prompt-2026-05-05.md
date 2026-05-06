# Portfolio Management Tool — Convergence Handoff Prompt (2026-05-05)

This document is the self-contained brief for a team of Claude Code agents to drive `/Users/orbot/Developer/work/Portfolio-Management-Tool` (Next.js 16 + FastAPI + Tauri v2) to **feature parity with the Reflex reference at `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`**, using an iterative side-by-side browser comparison loop and per-page commit checkpoints.

> **Hard rules — read these before doing anything else:**
> 1. **DO NOT STOP until the convergence criteria in §11 are met.** Partial work on a page is fine to commit, but the team should keep cycling pages until every page in §6 is checked off.
> 2. **Commit after every meaningful unit of work.** "Meaningful" = one page migrated, one missing page scaffolded, one chrome component aligned, one bug fixed. If you don't know whether to commit, commit. The cost of an extra commit is zero; the cost of losing two hours of work to a crashed terminal is high.
> 3. **The Reflex app at `~/Developer/work/Portfolio-Management-Tool-reflex` is the spec.** Visual + functional parity with that app, viewed in a browser, is what "done" means. Read its code, run it, screenshot it, diff it. Do not invent UX.
> 4. **Both apps share `pmt_core_pkg/pmt_core/`** for business logic. Treat the data shapes returned by `pmt_core` services / repositories as the contract. Don't fork them.

---

## 1. Mission

Bring the Next.js + FastAPI implementation to **visual and functional parity** with the Reflex reference, so a user navigating the same routes in both apps sees the same data, in the same grid, with the same columns, filters, formatting, and chrome (top nav, performance header, subtab nav, notification sidebar). The end state: the Next.js app is a drop-in replacement for the Reflex app, plus it ships as a Tauri desktop bundle.

The work is large and proceeds page-by-page. The methodology is a **convergence loop** (§5). The agents must not stop until §11 is satisfied.

---

## 2. Verified Current State (run on 2026-05-05)

| Check | Result |
|---|---|
| `pnpm --dir nextjs-frontend exec tsc --noEmit` | **PASS** (clean) |
| `pnpm --dir nextjs-frontend exec jest --runInBand` | **PASS** — 9/9 suites, 32/32 tests |
| `pnpm --dir nextjs-frontend build` (web) | **PASS** — 51 routes prerender as static |
| `pnpm --dir nextjs-frontend lint` | **FAIL** — 100 errors, ~75 are stale Tauri build artifacts under `src-tauri/target/**`; ~25 are real source-side (see §10) |
| Backend pytest with `TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3` | **PASS** — 26/26 tests in 0.35s |
| Branch | `feat/nextjs-fastapi-rebuild`, **1 commit behind origin** (`1f1f293` baseURL type fix), 48 modified + 9 untracked |
| Last commit | `86a86b7 chore(tauri): add plans and implementation for Tauri v2 desktop and mobile integration` |
| Origin remote | `https://github.com/orkapodavid/nextjs-fastapi-template.git` |

> Dashboard pages currently using mock data: **43/44**. Only `/dashboard/market-data/market-data` fetches from the live FastAPI backend. AG Grid is **not** installed in the Next.js frontend yet — the existing pages render with a basic shadcn `DataTable`. The reference uses AG Grid throughout.

---

## 3. The Two Codebases

### 3.1 The work tree (Next.js + FastAPI)
- Path: `/Users/orbot/Developer/work/Portfolio-Management-Tool`
- Branch: `feat/nextjs-fastapi-rebuild`
- Frontend: `nextjs-frontend/` — Next.js 16, React 19, TS, Tailwind, shadcn, Tauri v2 shell
- Backend: `fastapi_backend/` — FastAPI, fastapi-users, SQLAlchemy, Alembic
- Shared core: `pmt_core_pkg/pmt_core/` (workspace member)
- Web dev URL: `http://localhost:3000`
- Backend dev URL: `http://localhost:8000`
- Tauri sidecar dev URL: `http://127.0.0.1:18475`

### 3.2 The reference (Reflex)
- Path: `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`
- App: `app/` — Reflex (Python → React/Next.js) using `reflex_ag_grid`
- Shared core: `pmt_core_pkg/pmt_core/` (same package, same workspace pattern)
- Frontend URL: `http://localhost:3001/pmt/`
- Backend URL: `http://localhost:8001`
- Run: `cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex && uv run reflex run`
- Stop: `Ctrl-C` in that terminal, or `pkill -f 'reflex run'`

### 3.3 Why parity is feasible
Both repos already import `pmt_core_pkg`. The Reflex side calls `pmt_core.repositories.*` directly. The Next.js side reaches the same data through `fastapi_backend/app/routes/*.py` which currently wrap (or are intended to wrap) the same `pmt_core` services. **The data shapes are already shared** — the work is mostly UI (page → grid → columns) plus closing the few missing API endpoints.

---

## 4. Repository Shape (Next.js side — what you'll edit)

```text
nextjs-frontend/
├── app/
│   ├── dashboard/                           # 44 pages, 1 live, 43 mock (you'll convert all 44 to AG Grid + add 8 new)
│   │   ├── layout.tsx                       # Wraps in <DashboardAuthGate>
│   │   ├── page.tsx                         # Redirect to /dashboard/market-data/market-data
│   │   ├── market-data/<sub>/page.tsx       # 6 pages
│   │   ├── positions/<sub>/page.tsx         # 5 pages
│   │   ├── pnl/<sub>/page.tsx               # 4 pages
│   │   ├── risk/<sub>/page.tsx              # 3 (need 5: + pricer-warrant, pricer-bond)
│   │   ├── recon/<sub>/page.tsx             # 5 pages
│   │   ├── compliance/<sub>/page.tsx        # 3 (need 4: + monthly-exercise-limit)
│   │   ├── portfolio-tools/<sub>/page.tsx   # 6 (need 9: + deal-indication, po-settlement, short-ecl)
│   │   ├── instruments/<sub>/page.tsx       # 3 (need 5: + instrument-data, instrument-term)
│   │   ├── events/<sub>/page.tsx            # 3 pages
│   │   ├── operations/<sub>/page.tsx        # 2 pages
│   │   └── orders/<sub>/page.tsx            # 2 pages
│   ├── openapi-client/                      # AUTO-GENERATED — do not hand edit
│   └── clientService.ts                     # Re-export point; import from here
├── components/
│   ├── auth/dashboard-auth-gate.tsx         # NEW (uncommitted) — client-side route guard
│   ├── grid/                                # CREATE THIS — AG Grid wrapper + shared toolbar
│   ├── layout/
│   │   ├── top-navigation.tsx               # Bring to parity with reflex top_navigation.py
│   │   ├── performance-header.tsx           # Bring to parity with reflex performance_header.py
│   │   ├── subtab-navigation.tsx            # Bring to parity with reflex sub_tab_link
│   │   ├── data-table.tsx                   # Will be replaced by AG Grid usages, then deleted
│   │   └── notification-sidebar.tsx         # CREATE — port reflex notification_sidebar.py
│   └── actions/                             # All client-side now, no 'use server'
├── lib/
│   ├── auth/token-storage.ts                # NEW (uncommitted)
│   ├── runtime-config.ts                    # NEW (uncommitted)
│   ├── clientConfig.ts                      # async ensureClientConfigured()
│   └── utils.ts                             # getApiData / getApiError helpers
└── src-tauri/                               # NEW (uncommitted) — Tauri v2 shell
```

---

## 5. The Convergence Loop (the methodology)

This is how every page gets done. Treat it as a closed loop and don't break out of it for a given page until the page passes the per-page acceptance gate.

```
  ┌────────────────────────────────────────────────────────────────────┐
  │ For each page in §6, in order:                                    │
  │                                                                    │
  │   ① REFERENCE  → read the reflex page + its AG Grid component +   │
  │                  state + service to capture columns/filters/format │
  │   ② OBSERVE    → load reflex URL in headless browser, capture     │
  │                  screenshot + DOM snapshot                         │
  │   ③ IMPLEMENT  → migrate/scaffold the Next.js page to match        │
  │   ④ COMPARE    → load Next.js URL in headless browser, capture    │
  │                  screenshot + DOM, diff against reflex             │
  │   ⑤ DECIDE     → converged? → COMMIT, advance.                     │
  │                  not yet? → list deltas, GOTO ③                    │
  │                                                                    │
  │   At any point if § verification matrix breaks: stop, fix, commit. │
  └────────────────────────────────────────────────────────────────────┘
```

### 5.1 Bringing both apps up

Keep three terminals (or use `run_in_background` for two of them):

**Terminal A — FastAPI backend (Next.js side)**
```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/fastapi_backend
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal B — Next.js dev server**
```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm dev
# → http://localhost:3000
```

**Terminal C — Reflex reference**
```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
# → http://localhost:3001/pmt/
```

Health-check each before starting work:
- `curl http://localhost:8000/api/health` → `{"status":"ok",...}`
- `curl -I http://localhost:3000` → 200
- `curl -I http://localhost:3001/pmt/` → 200

If any of them fail, fix that first. Don't try to converge a page when its data source is down.

### 5.2 Browser comparison via `playwright-cli`

The skill `playwright-cli` is available. Use it for steps ② and ④. You do **not** need to run a full Playwright test suite — you need to drive a browser, snapshot, and read DOM.

For each page convergence:

```bash
# Reference snapshot (Reflex):
playwright-cli open http://localhost:3001/pmt/<reflex-route>
# capture: screenshot, computed columns from `.ag-header-cell-text`, row count, sample data row

# Implementation snapshot (Next.js):
playwright-cli open http://localhost:3000/dashboard/<nextjs-route>
# capture: screenshot, columns, row count, sample row

# Diff:
# - Column headers (text, order, alignment) — must match
# - Row count — should match if hitting the same data source; if it doesn't, that's the first signal
# - Sample row values — same numeric values (ignore color/cosmetic diffs unless brand colors are off)
# - Layout chrome — top nav module name, performance header tickers, subtab active state
```

If the page requires login (the dashboard auth gate redirects unauthenticated users), use the test account: register a user once via `/register`, store the credentials in `~/.pmt-test-account` (gitignored), and have playwright log in as part of the comparison flow.

### 5.3 Per-page acceptance gate (the "converged?" check)

A page is **converged** when **all** of the following hold:

| Aspect | Required state |
|---|---|
| **Route** | Path matches reflex (modulo `/dashboard/` prefix; reflex uses bare `/positions/positions`, Next.js uses `/dashboard/positions/positions`) |
| **Columns** | Same column set, same headers, same order, same alignment, same number formatting (currency/percent/integer) |
| **Filters** | Same column-level filter type (text/number/date) — AG Grid `agTextColumnFilter` / `agNumberColumnFilter` / `agDateColumnFilter` |
| **Pinned columns** | Same `pinned: 'left'` columns (typically `ticker`) |
| **Toolbar** | Refresh button + search input present, behaviorally identical |
| **Subtab navigation** | Subtabs render in the same order with the same labels and active state styling |
| **Data source** | Calls the live FastAPI endpoint via the generated client (no mock arrays, no `const mockData = [...]`) |
| **Auth** | Missing/invalid token redirects to `/login` |
| **Empty state** | Renders a sensible empty-state message when the API returns `[]` |
| **Error state** | Renders a visible error block (red border, error message) on non-401 errors |
| **Verification matrix** | TSC clean, Jest green, web build PASS — **after** the page is migrated |

If 1 or more aspects fail, the page is not converged. Loop back to step ③ in §5.

### 5.4 Per-page commit (mandatory)

Once a page passes its acceptance gate:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool

# Run the verification matrix; if anything fails, fix before committing
pnpm --dir nextjs-frontend exec tsc --noEmit
pnpm --dir nextjs-frontend exec jest --runInBand
pnpm --dir nextjs-frontend build

# Stage just the files for this page
git add nextjs-frontend/app/dashboard/<module>/<page>/page.tsx \
        nextjs-frontend/components/grid/<any-shared-grid-files-touched>

# Commit
git commit -m "$(cat <<'EOF'
feat(<module>): migrate <page> to live API + AG Grid

Matches reflex reference at app/pages/<module>/<page>_page.py and
app/components/<module>/<page>_ag_grid.py. Columns, filters, and
formatting verified against http://localhost:3001/pmt/<route>.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

**Push every 3–5 commits** to `feat/nextjs-fastapi-rebuild` so origin has a recoverable trail:

```bash
git push origin feat/nextjs-fastapi-rebuild
```

If push is rejected (origin moved), `git pull --rebase origin feat/nextjs-fastapi-rebuild`, resolve, push again. Never force-push to a shared branch.

---

## 6. The Convergence Worklist

This is **the** worklist. Tick boxes as you go. Reflex paths are relative to `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/app/`. Next.js paths are relative to `/Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend/`.

**Section A — Land the uncommitted Tauri integration first.** Before doing any convergence work, commit and push the in-flight Tauri changes (§9).

### Section B — Layout chrome convergence
Do this before any page work; downstream pages depend on it.

- [ ] **Top navigation** (`components/layout/top-navigation.tsx` ↔ reflex `app/components/shared/top_navigation.py`)
- [ ] **Performance header** (`components/layout/performance-header.tsx` ↔ `performance_header.py`) — major P&L / market-data ticker strip across the top
- [ ] **Subtab navigation** (`components/layout/subtab-navigation.tsx` ↔ `module_layout.py:sub_tab_link`)
- [ ] **Notification sidebar** (CREATE `components/layout/notification-sidebar.tsx` ↔ `notification_sidebar.py`)
- [ ] **Mobile nav** (port `mobile_nav.py` if responsive parity is required; deprioritize otherwise)

### Section C — AG Grid foundation
- [ ] Add deps: `pnpm add ag-grid-community ag-grid-react` (use latest v33.x). Match the Reflex `reflex_ag_grid` version family — verify with `grep reflex_ag_grid ~/Developer/work/Portfolio-Management-Tool-reflex/uv.lock`.
- [ ] Create `components/grid/data-grid.tsx` — wrapper that consumes columns + rows + a search input + refresh button + loading/error states. Mirror the toolbar shape from reflex `ag_grid_config/grid_toolbar` (see `~/Developer/work/Portfolio-Management-Tool-reflex/app/components/shared/ag_grid_config/`).
- [ ] Create `components/grid/columns.ts` — typed column-def helpers, e.g. `textColumn`, `numberColumn`, `currencyColumn`, `percentColumn`, `dateColumn` — so dashboard pages declare columns in 2-line entries.
- [ ] Add `__tests__/dataGrid.test.tsx` — render the wrapper with a stub dataset; assert headers and a sample cell.
- [ ] **Commit** at this point.

### Section D — Per-page convergence

For every row below, run the convergence loop in §5 and commit on pass. Each page lists: Reflex page file → Reflex grid component → Next.js page path → generated client function. The right-most column is your tick.

#### Market Data (6)
| Reflex page | Reflex grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `pages/market_data/market_data_page.py` | `components/market_data/market_data_ag_grid.py` | `app/dashboard/market-data/market-data/page.tsx` | `marketDataGetMarketData` | ☐ (pre-existing live) |
| `pages/market_data/fx_data_page.py` | `components/market_data/fx_data_ag_grid.py` | `app/dashboard/market-data/fx-data/page.tsx` | `marketDataGetFxData` | ☐ |
| `pages/market_data/historical_data_page.py` | `components/market_data/historical_data_ag_grid.py` | `app/dashboard/market-data/historical-data/page.tsx` | `marketDataGetHistoricalData` | ☐ |
| `pages/market_data/market_hours_page.py` | `components/market_data/market_hours_ag_grid.py` | `app/dashboard/market-data/market-hours/page.tsx` | `marketDataGetMarketHours` | ☐ |
| `pages/market_data/ticker_data_page.py` | (reflex route is `reference-data`) | `app/dashboard/market-data/ticker-data/page.tsx` | `marketDataGetTickerData` | ☐ |
| `pages/market_data/trading_calendar_page.py` | `components/market_data/trading_calendar_ag_grid.py` | `app/dashboard/market-data/trading-calendar/page.tsx` | `marketDataGetTradingCalendar` | ☐ |

#### Positions (5)
| Reflex page | Reflex grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `pages/positions/positions_page.py` | `components/positions/positions_ag_grid.py` | `app/dashboard/positions/positions/page.tsx` | `positionsGetPositions` | ☐ |
| `pages/positions/stock_position_page.py` | `components/positions/stock_position_ag_grid.py` | `app/dashboard/positions/stock-position/page.tsx` | `positionsGetStockPositions` | ☐ |
| `pages/positions/warrant_position_page.py` | `components/positions/warrant_position_ag_grid.py` | `app/dashboard/positions/warrant-position/page.tsx` | `positionsGetWarrantPositions` | ☐ |
| `pages/positions/bond_positions_page.py` | `components/positions/bond_position_ag_grid.py` | `app/dashboard/positions/bond-positions/page.tsx` | `positionsGetBondPositions` | ☐ |
| `pages/positions/trade_summary_page.py` | `components/positions/trade_summary_ag_grid.py` | `app/dashboard/positions/trade-summary/page.tsx` | `positionsGetTradeSummary` | ☐ |

#### P&L (4)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `pnl/pnl_summary_page.py` | `components/pnl/pnl_summary_ag_grid.py` | `dashboard/pnl/pnl-summary/page.tsx` | `pnlGetPnlSummary` | ☐ |
| `pnl/pnl_change_page.py` | `components/pnl/pnl_change_ag_grid.py` | `dashboard/pnl/pnl-change/page.tsx` | `pnlGetPnlChanges` | ☐ |
| `pnl/pnl_currency_page.py` | `components/pnl/pnl_currency_ag_grid.py` | `dashboard/pnl/pnl-currency/page.tsx` | `pnlGetPnlByCurrency` | ☐ |
| `pnl/pnl_full_page.py` | `components/pnl/pnl_full_ag_grid.py` | `dashboard/pnl/pnl-full/page.tsx` | `pnlGetPnlFull` | ☐ |

#### Risk (5 — 2 are MISSING in Next.js)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `risk/risk_measures_page.py` | `components/risk/risk_measures_ag_grid.py` | `dashboard/risk/risk-measures/page.tsx` | `riskGetRiskMeasures` | ☐ |
| `risk/risk_inputs_page.py` | `components/risk/risk_inputs_ag_grid.py` | `dashboard/risk/risk-inputs/page.tsx` | `riskGetRiskInputs` | ☐ |
| `risk/delta_change_page.py` | `components/risk/delta_change_ag_grid.py` | `dashboard/risk/delta-change/page.tsx` | `riskGetDeltaChange` | ☐ |
| `risk/pricer_warrant_page.py` | `components/risk/pricer_warrant_*` | **CREATE** `dashboard/risk/pricer-warrant/page.tsx` | (new endpoint — see §8) | ☐ |
| `risk/pricer_bond_page.py` | `components/risk/pricer_bond_*` | **CREATE** `dashboard/risk/pricer-bond/page.tsx` | (new endpoint — see §8) | ☐ |

#### Reconciliation (5)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `reconciliation/pps_recon_page.py` | `components/reconciliation/pps_recon_ag_grid.py` | `dashboard/recon/pps-recon/page.tsx` | `reconciliationGetPpsRecon` | ☐ |
| `reconciliation/settlement_recon_page.py` | `components/reconciliation/settlement_recon_ag_grid.py` | `dashboard/recon/settlement-recon/page.tsx` | `reconciliationGetSettlementRecon` | ☐ |
| `reconciliation/failed_trades_page.py` | `components/reconciliation/failed_trades_ag_grid.py` | `dashboard/recon/failed-trades/page.tsx` | `reconciliationGetFailedTrades` | ☐ |
| `reconciliation/pnl_recon_page.py` | `components/reconciliation/pnl_recon_ag_grid.py` | `dashboard/recon/pnl-recon/page.tsx` | `reconciliationGetPnlRecon` | ☐ |
| `reconciliation/risk_input_recon_page.py` | `components/reconciliation/risk_input_recon_ag_grid.py` | `dashboard/recon/risk-input-recon/page.tsx` | `reconciliationGetRiskInputRecon` | ☐ |

#### Compliance (4 — 1 MISSING)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `compliance/restricted_list_page.py` | `components/compliance/restricted_list_ag_grid.py` | `dashboard/compliance/restricted-list/page.tsx` | `complianceGetRestrictedList` | ☐ |
| `compliance/undertakings_page.py` | `components/compliance/undertakings_ag_grid.py` | `dashboard/compliance/undertakings/page.tsx` | `complianceGetUndertakings` | ☐ |
| `compliance/beneficial_ownership_page.py` | `components/compliance/beneficial_ownership_ag_grid.py` | `dashboard/compliance/beneficial-ownership/page.tsx` | `complianceGetBeneficialOwnership` | ☐ |
| `compliance/monthly_exercise_limit_page.py` | `components/compliance/monthly_exercise_limit_ag_grid.py` | **CREATE** `dashboard/compliance/monthly-exercise-limit/page.tsx` | (new endpoint — see §8) | ☐ |

#### Portfolio Tools (9 — 3 MISSING)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `portfolio_tools/pay_to_hold_page.py` | grid | `dashboard/portfolio-tools/pay-to-hold/page.tsx` | `portfolioToolsGetPayToHold` | ☐ |
| `portfolio_tools/stock_borrow_page.py` | grid | `dashboard/portfolio-tools/stock-borrow/page.tsx` | `portfolioToolsGetStockBorrow` | ☐ |
| `portfolio_tools/reset_dates_page.py` | grid | `dashboard/portfolio-tools/reset-dates/page.tsx` | `portfolioToolsGetResetDates` | ☐ |
| `portfolio_tools/coming_resets_page.py` | grid | `dashboard/portfolio-tools/coming-resets/page.tsx` | `portfolioToolsGetComingResets` | ☐ |
| `portfolio_tools/cb_installments_page.py` | grid | `dashboard/portfolio-tools/cb-installments/page.tsx` | `portfolioToolsGetCbInstallments` | ☐ |
| `portfolio_tools/excess_amount_page.py` | grid | `dashboard/portfolio-tools/excess-amount/page.tsx` | `portfolioToolsGetExcessAmount` | ☐ |
| `portfolio_tools/deal_indication_page.py` | grid | **CREATE** `dashboard/portfolio-tools/deal-indication/page.tsx` | (new endpoint — see §8) | ☐ |
| `portfolio_tools/po_settlement_page.py` | grid | **CREATE** `dashboard/portfolio-tools/po-settlement/page.tsx` | (new endpoint — see §8) | ☐ |
| `portfolio_tools/short_ecl_page.py` | grid | **CREATE** `dashboard/portfolio-tools/short-ecl/page.tsx` | (new endpoint — see §8) | ☐ |

#### Instruments (5 — 2 MISSING)
| Reflex | Grid | Next.js page | Client fn | Done |
|---|---|---|---|:---:|
| `instruments/ticker_data_page.py` | grid | `dashboard/instruments/ticker-data/page.tsx` | `instrumentsGetTickerData` | ☐ |
| `instruments/stock_screener_page.py` | grid | `dashboard/instruments/stock-screener/page.tsx` | `instrumentsGetStockScreener` | ☐ |
| `instruments/special_term_page.py` | grid | `dashboard/instruments/special-terms/page.tsx` | `instrumentsGetSpecialTerms` | ☐ |
| `instruments/instrument_data_page.py` | grid | **CREATE** `dashboard/instruments/instrument-data/page.tsx` | (new endpoint — see §8) | ☐ |
| `instruments/instrument_term_page.py` | grid | **CREATE** `dashboard/instruments/instrument-term/page.tsx` | (new endpoint — see §8) | ☐ |

#### Events (3)
| Reflex | Next.js page | Client fn | Done |
|---|---|---|:---:|
| `events/event_calendar_page.py` | `dashboard/events/event-calendar/page.tsx` | `eventsGetEventCalendar` | ☐ |
| `events/event_stream_page.py` | `dashboard/events/event-stream/page.tsx` | `eventsGetEventStream` | ☐ |
| `events/reverse_inquiry_page.py` | `dashboard/events/reverse-inquiry/page.tsx` | `eventsGetReverseInquiries` | ☐ |

#### Operations (2)
| Reflex | Next.js page | Client fn | Done |
|---|---|---|:---:|
| `operations/daily_procedure_check_page.py` | `dashboard/operations/daily-procedures/page.tsx` | `operationsGetDailyProcedures` | ☐ |
| `operations/operation_process_page.py` | `dashboard/operations/operation-process/page.tsx` | `operationsGetOperationProcesses` | ☐ |

#### Orders (2)
| Reflex | Next.js page | Client fn | Done |
|---|---|---|:---:|
| `orders/emsx_order_page.py` | `dashboard/orders/emsx-order/page.tsx` | (look up in `app/openapi-client/sdk.gen.ts` under `orders*`) | ☐ |
| `orders/emsx_route_page.py` | `dashboard/orders/emsx-route/page.tsx` | (look up; likely `ordersGetOrderRoutes`) | ☐ |

**Total worklist: 1 layout convergence + 1 grid foundation + 52 page convergences (44 migrate + 8 scaffold).**

---

## 7. Reference Pattern (use this for every page)

`app/dashboard/market-data/market-data/page.tsx` is the **only** currently-live page. Read it first. After Section C lands, every page should look like this skeleton:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { <generatedFn> } from "@/app/clientService";
import { DataGrid } from "@/components/grid/data-grid";
import { textColumn, numberColumn, currencyColumn, percentColumn, dateColumn } from "@/components/grid/columns";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

const columns = [
  textColumn({ field: "ticker", header: "Ticker", pinned: "left" }),
  // …mirror the column set from the reflex AG Grid component, in the same order, with the same headers
];

type Row = { /* shape matching pmt_core record TypedDict */ };

export default function Page() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) { router.replace("/login"); return; }

    const response = await <generatedFn>({ headers: { Authorization: `Bearer ${token}` } });
    const error = getApiError(response);

    if (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 401 || status === 403) { router.replace("/login"); return; }
      setErrorMessage(extractMessage(error));
      setIsLoading(false);
      return;
    }

    setRows((getApiData(response) as Row[]) ?? []);
    setErrorMessage(null);
    setIsLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={load}
      emptyMessage="No <thing> available."
    />
  );
}
```

**Rules:**
- Always import generated functions from `@/app/clientService` (never `@/app/openapi-client/...` directly).
- Pinned `ticker` column on the left for every page that has a ticker — matches Reflex.
- Currency, percent, integer formatting must match the reflex grid's `value_formatter`. When in doubt, read the reflex AG Grid component and copy the formatter logic into a typed helper in `components/grid/columns.ts`.
- Always handle 401/403 → redirect; other errors → visible error block.
- Always wire a refresh button (`onRefresh={load}`).
- Empty arrays from the API are valid — display the empty-state message, do not error.

---

## 8. Backend Gaps — Endpoints That Likely Need to Be Added

For the 8 new pages, an endpoint may not yet exist. Before scaffolding the page, verify:

```bash
# Probe the endpoint
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/api/<module>/<thing>
```

If 404 or "Method Not Allowed", you need to add a new route. Pattern:

1. `pmt_core_pkg/pmt_core/repositories/<module>/` — already has the data fetcher (the Reflex side already calls it). Verify with:
   ```bash
   grep -r "<thing>" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/pmt_core_pkg/
   ```
2. `fastapi_backend/app/routes/<module>.py` — add a new route function modeled on the existing ones (e.g. `risk_router.add_api_route(...)`).
3. Regenerate the OpenAPI client: with backend up on :8000, run `pnpm --dir nextjs-frontend generate-client`. This refreshes `app/openapi-client/sdk.gen.ts` so a new generated function appears (e.g. `riskGetPricerWarrant`).
4. Re-export it via `app/clientService.ts` if you want the `withConfiguredClient` wrapping (optional — direct import from `./openapi-client` works for raw dashboard pages).
5. Add a backend test in `fastapi_backend/tests/routes/`.

The 8 new endpoints needed (verify each — some may already exist with a different name):

| Page | Endpoint to expose | Pmt-core repository |
|---|---|---|
| `risk/pricer-warrant` | `GET /api/risk/pricer/warrant` | `pmt_core.repositories.risk` |
| `risk/pricer-bond` | `GET /api/risk/pricer/bond` | `pmt_core.repositories.risk` |
| `compliance/monthly-exercise-limit` | `GET /api/compliance/monthly-exercise-limit` | `pmt_core.repositories.compliance` |
| `portfolio-tools/deal-indication` | `GET /api/portfolio-tools/deal-indication` | `pmt_core.repositories.portfolio_tools` |
| `portfolio-tools/po-settlement` | `GET /api/portfolio-tools/po-settlement` | `pmt_core.repositories.portfolio_tools` |
| `portfolio-tools/short-ecl` | `GET /api/portfolio-tools/short-ecl` | `pmt_core.repositories.portfolio_tools` |
| `instruments/instrument-data` | `GET /api/instruments/instrument-data` | `pmt_core.repositories.instruments` |
| `instruments/instrument-term` | `GET /api/instruments/instrument-term` | `pmt_core.repositories.instruments` |

Each endpoint addition gets its own commit before the corresponding page commit.

---

## 9. Land the Uncommitted Tauri Work First

Before any convergence work, ship the in-flight Tauri integration. The 48 modified + 9 untracked files form one coherent change. Suggested commit grouping:

**Commit A — Backend desktop runtime + health endpoint**
```
fastapi_backend/app/runtime.py                    (new)
fastapi_backend/app/routes/health.py              (new)
fastapi_backend/commands/run_tauri_sidecar.py     (new)
fastapi_backend/tests/test_runtime.py             (new)
fastapi_backend/app/main.py                       (include health_router)
fastapi_backend/app/config.py                     (RUNTIME_MODE, APP_DATA_DIR)
fastapi_backend/pyproject.toml
fastapi_backend/requirements.txt
fastapi_backend/uv.lock
```

**Commit B — Backend DB normalization (postgres+sqlite)**
```
fastapi_backend/app/database.py
fastapi_backend/app/models.py
fastapi_backend/app/users.py
fastapi_backend/alembic.ini
fastapi_backend/alembic_migrations/env.py
fastapi_backend/alembic_migrations/versions/b389592974f8_add_item_model.py
fastapi_backend/tests/conftest.py
fastapi_backend/tests/test_database.py
```

**Commit C — Frontend client-side auth refactor**
```
nextjs-frontend/lib/auth/token-storage.ts                (new)
nextjs-frontend/lib/runtime-config.ts                    (new)
nextjs-frontend/lib/clientConfig.ts
nextjs-frontend/components/auth/dashboard-auth-gate.tsx  (new)
nextjs-frontend/__tests__/dashboardLayout.test.tsx       (new)
nextjs-frontend/app/dashboard/layout.tsx
nextjs-frontend/app/clientService.ts
nextjs-frontend/components/actions/*.ts                  (all)
nextjs-frontend/components/layout/top-navigation.tsx
nextjs-frontend/app/login/page.tsx
nextjs-frontend/app/register/page.tsx
nextjs-frontend/app/password-recovery/page.tsx
nextjs-frontend/app/password-recovery/confirm/page.tsx
nextjs-frontend/app/dashboard/add-item/page.tsx
nextjs-frontend/app/dashboard/deleteButton.tsx
nextjs-frontend/app/dashboard/page.tsx
nextjs-frontend/app/page.tsx
nextjs-frontend/__tests__/login.test.tsx
nextjs-frontend/__tests__/loginPage.test.tsx
nextjs-frontend/__tests__/passwordReset.test.tsx
nextjs-frontend/__tests__/passwordResetConfirm.test.tsx
nextjs-frontend/__tests__/passwordResetConfirmPage.test.tsx
nextjs-frontend/lib/utils.ts
```

**Commit D — Tauri v2 shell + build pipeline**
```
nextjs-frontend/src-tauri/                         (entire new directory)
nextjs-frontend/next.config.mjs
nextjs-frontend/package.json
nextjs-frontend/pnpm-lock.yaml
nextjs-frontend/.env.example
nextjs-frontend/.gitignore
nextjs-frontend/package-lock.json                  (delete)
nextjs-frontend/proxy.ts                           (delete)
```

**Commit E — Docs + market-data live migration**
```
README.md
continuations.md
docs/plans/Recommendation for Extending  to Web, Desktop, and Mobile with Tauri.md
docs/plans/tauri-implementation-plan.md
docs/plans/handoff-prompt-2026-05-05.md
nextjs-frontend/app/dashboard/market-data/market-data/page.tsx
```

**Then integrate origin's `1f1f293` baseURL fix:**
```bash
git fetch origin
git rebase origin/feat/nextjs-fastapi-rebuild
git push origin feat/nextjs-fastapi-rebuild
```

If a conflict appears in `app/openapi-client/client.gen.ts`, accept origin's version.

---

## 10. Lint Cleanup (one-shot)

`pnpm lint` reports 100 errors, but only ~25 are real source-side. Fix in one commit:

| File | Errors | Fix |
|---|---|---|
| `__tests__/loginPage.test.tsx:1` | 1 unused `waitFor` | remove the import |
| `next.config.mjs` | 1 `process` no-undef | add `/* eslint-env node */` at top |
| `src-tauri/scripts/build-sidecar.mjs` | 14 `process`/`console` | add `/* eslint-env node */` at top |
| `src-tauri/scripts/run-next-with-tauri-env.mjs` | 9 `process`/`console` | add `/* eslint-env node */` at top |
| `eslint.config.mjs` | — | add `"src-tauri/target/**"` to the `ignores` array |

After this commit, `pnpm lint` should report 0 errors. **Keep it at 0** — every subsequent commit must leave lint clean.

---

## 11. Convergence Exit Criteria (the "stop" conditions)

You are **done** when **all** of the following are true. Until then, keep cycling. Do not stop on partial completion.

1. All 52 page rows in §6 are checked off.
2. Section B (layout chrome) is checked off.
3. Section C (AG Grid foundation) is committed.
4. `git status` clean on `feat/nextjs-fastapi-rebuild`, fully pushed to origin.
5. `grep -rE 'const mockData|mock_data|const data = \[' nextjs-frontend/app/dashboard | wc -l` → `0`.
6. `pnpm exec tsc --noEmit` clean.
7. `pnpm exec jest --runInBand` ≥ 9 suites, ≥ 32 tests PASS.
8. `pnpm lint` reports `0 errors, 0 warnings`.
9. `pnpm build` (web) PASS. Route count = 52 dashboard pages + auth pages, all `○ Static`.
10. `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` PASS.
11. Backend pytest passes; report exact PASS count.
12. **Browser parity proof**: for each of the 11 modules, capture a side-by-side screenshot of one page from reflex (port 3001) and the corresponding page from Next.js (port 3000). Save under `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`. Commit them.
13. `continuations.md` updated with the final state.

---

## 12. Verification Matrix (run between commits)

```bash
# Frontend
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand
pnpm lint
pnpm build

# Desktop static export
TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 \
  NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build

# Backend
cd ../fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q

# Tauri shell sanity (only when src-tauri/ changed)
cargo check --manifest-path \
  /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend/src-tauri/Cargo.toml
```

Required exit numbers per run:
- TSC: clean (no output, exit 0)
- Jest: report exact `X passed, X total`
- Lint: 0 errors, 0 warnings
- Web build: PASS, route count printed
- Desktop build: PASS, `out/` populated
- Backend pytest: report exact `N passed in T s`

**Always cite numbers — never just "all green".**

---

## 13. Constraints

- **The Reflex app is the spec.** When in doubt about UX, run reflex and look at it. Do not invent.
- **Do not break the web build path.** `TAURI_BUILD=1` is the only flag that switches Next to static export.
- **Do not hand-edit `app/openapi-client/`.** It's auto-generated. If you need a new function, regenerate via `pnpm generate-client` against a running backend.
- **Keep `pnpm-lock.yaml` as the only frontend lockfile.** Do not let `npm install` regenerate `package-lock.json`. If it appears, delete and `pnpm install --frozen-lockfile`.
- **Auth pages must stay client-rendered.** No `'use server'` on actions.
- **Dashboard pages must not server-render protected data.** Data fetches happen in `useEffect` after `<DashboardAuthGate>` confirms the session. Server-side `cookies()` is gone and must not return.
- **No new dependencies without justification.** AG Grid is justified; avoid adding chart/grid/UI libraries beyond that without checking what reflex uses (it uses `recharts` for charts, `reflex_ag_grid` for grids).
- **No comments that restate code.** Only non-obvious WHY.
- **Commit per page.** Never accumulate more than one page's worth of changes in the working tree at a time, except during the initial Tauri commits in §9.
- **Push at least every 5 commits** — accidental terminal closure should never lose more than ~30 minutes of work.

---

## 14. Recovery From Interruption

If the session ends mid-flight (laptop sleep, terminal crash, agent timeout), the next agent picks up from git. The contract is:

1. **`git status` is the truth.** Anything uncommitted is either a half-done page (finish it or `git stash` and revisit) or stale debris (clean it).
2. **Walk §6 and check what's already done** by inspecting commit messages: `git log --oneline -50 | grep -E 'feat\((module)\)'`.
3. **Resume from the first unchecked page** in §6.

If the working tree has a half-migrated page from a prior session:
- If the page builds and tests pass, finish it via the convergence loop and commit.
- If it doesn't build, decide: complete or revert. Don't ship broken commits.

To verify state after recovery, run §12 verification matrix and §11 exit criteria.

---

## 15. Useful One-Liners

```bash
# Find all dashboard pages still using mock data
grep -rlE 'const mockData|const data = \[' nextjs-frontend/app/dashboard

# Confirm a specific page is on the live pattern
grep -lE 'getAuthToken|@/lib/auth/token-storage' nextjs-frontend/app/dashboard/<m>/<p>/page.tsx

# Inspect a generated function signature
grep -A 6 '^export const <fnName>' nextjs-frontend/app/openapi-client/sdk.gen.ts

# Re-generate the OpenAPI client (backend up on :8000)
cd nextjs-frontend && pnpm generate-client

# Spin up reflex reference
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex && uv run reflex run

# Spin up Next.js dev (with backend in another terminal)
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend && pnpm dev

# Stop reflex
pkill -f 'reflex run'

# Quick desktop dev loop (after Tauri lands)
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend && pnpm tauri dev

# Compare a page header set between reflex and nextjs (rough sanity)
playwright-cli open http://localhost:3001/pmt/positions/positions     # reflex
playwright-cli open http://localhost:3000/dashboard/positions/positions  # nextjs
# Visually diff column headers, row count, sample row.
```

---

## 16. Resume Prompt (paste into a fresh session)

```
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read docs/plans/handoff-prompt-2026-05-05.md top-to-bottom before doing anything. It is the source of truth.

Mission: drive the Next.js frontend + FastAPI backend to feature parity with the Reflex reference at /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex via the convergence loop in §5.

Hard rules:
- Do not stop until §11 exit criteria are met. Loop pages until done.
- Commit per page (§5.4). Push every 3–5 commits.
- The reflex app at port 3001 is the spec; the next.js app at port 3000 must visually + functionally match it.
- Do not regenerate package-lock.json. Do not hand-edit app/openapi-client/. Do not add server-side cookies() calls.

Before starting, run §12 verification matrix and report exact PASS/FAIL counts. Then walk §6 from the first unchecked page and proceed in order.

If you stop mid-page for any reason, commit progress first.
```

---

## 17. Open Questions to Surface to the User

1. **Backend test count gap**: continuation log claims `116/116 PASS` from 2026-03-22; today reports `26/26 PASS`. Were route tests pruned during the Tauri refactor, or do they need restoring? Action: ask the user before adding/removing tests beyond what each migration explicitly requires.
2. **Mobile (iOS/Android) target**: the planning doc covers mobile but no mobile scaffold exists. Out of scope unless user reprioritizes.
3. **AG Grid license**: AG Grid Enterprise has license-gated features (set filter, master/detail, status bar). Reflex uses `reflex_ag_grid` which is Community. Default to Community here too unless the user requests Enterprise.

---

End of handoff prompt.
