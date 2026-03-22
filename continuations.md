# Portfolio Management Tool - Continuation Log

## Current Status (2026-03-22)

### Completed

**Backend (FastAPI)**
- 13 route modules registered under `/api/` prefix in `main.py`
  - `positions` (5 endpoints), `pnl` (5), `market_data` (9), `risk` (3), `compliance` (3), `reconciliation` (5), `portfolio_tools` (6), `instruments` (3), `events` (3), `operations` (2), `orders` (2), `performance` (2)
- Shared input validation in `app/routes/_validation.py` (`validate_date`, `Literal` types for enums, `_parse_tickers`)
- `pmt_core_pkg` mounted as editable dependency via `[tool.uv.sources]`
- `MOCK_DATA: bool = True` config flag in `app/config.py`
- Docker Compose updated with `pmt_core_pkg` volume mount

**Frontend (Next.js 16 / React 19)**
- 4-region layout: TopNavigation, PerformanceHeader, SubtabNavigation, Workspace
- 11 PMT modules with 43 page files across dashboard routes
- Catppuccin Mocha-inspired dark financial dashboard theme (`globals.css`)
- Reusable `DataTable` component with financial value coloring
- Module definitions in `lib/constants.ts` (IDs, labels, icons, subtabs)
- React 19 + Radix UI type compatibility fixes (`label.tsx`, `dropdown-menu.tsx`)
- shadcn/ui components with Tailwind CSS

**AG Grid Demo App** (NEW - committed 2026-03-22)
- 26 demo pages converted from reflex_ag_grid to pure Next.js + AG Grid 33 React
- Frontend: `ag-grid-demo/frontend/` - Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: `ag-grid-demo/backend/` - FastAPI with WebSocket, CRUD, validation, background task endpoints
- Gallery page + NavBar with all 26 demo links
- Shared components: DemoLayout, StatusBadge, NotificationPanel, GridProvider
- Shared lib: types.ts, data.ts (with simulatePriceTick), columns.ts
- Catppuccin Mocha dark theme with AG Grid Quartz
- Demos 10/21 connect to FastAPI with automatic local fallback
- Demos 07/14 use client-side logic (backend endpoints available for external use)
- Demo 13 uses real `api.applyTransaction()` for add/update/remove
- All demos use StrictMode-safe patterns (refs, pure updaters)
- Backend has Pydantic v2 field validators (CRUD: name, email, department, salary)
- Price simulation floors at 0.01 across all frontend and backend code
- `enableCellChangeFlash` on `defaultColDef` (AG Grid v31.2+ column-level API)
- Codex review: PASS (4 review cycles)
- Playwright E2E: 26/26 demos render correctly
- `next build` and `npx tsc --noEmit` pass with zero errors

**Infrastructure**
- Migrated from Reflex framework to Next.js + FastAPI template
- JWT auth via fastapi-users preserved from template
- OpenAPI client generation setup (@hey-api/openapi-ts) from template

### Remaining Work

1. **Frontend-to-backend API wiring** - All 43 PMT page files currently use local mock data; need to call FastAPI endpoints via the generated OpenAPI client
2. **Loading/error states** - PMT pages need loading spinners and error boundaries
3. **Test fixes** - Pre-existing `@testing-library/react` v16 export issues in template test files
4. **OpenAPI client generation** - Run `@hey-api/openapi-ts` to generate typed client from FastAPI's OpenAPI schema

---

## Continuation Prompt: Test AG Grid Demo App

Use the following prompt in a new conversation to have another LLM run comprehensive end-to-end testing of the AG Grid demo app.

### Prompt

```
I need you to run comprehensive end-to-end testing on the AG Grid demo app at:
/Users/orbot/Developer/work/Portfolio-Management-Tool/ag-grid-demo/

This app has 26 AG Grid feature demos built with Next.js 16 + FastAPI. It was just built
and needs thorough testing before being considered production-ready.

**Setup:**
1. Install and start the frontend:
   cd ag-grid-demo/frontend && npm install && npm run dev
   (runs on http://localhost:3001)

2. Install and start the backend:
   cd ag-grid-demo/backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8001

**What to test:**

1. **Build verification**
   - Run `npx tsc --noEmit` in frontend/ - should pass with zero errors
   - Run `npx next build` in frontend/ - should complete successfully
   - Run `python3 -m py_compile` on all backend .py files

2. **Gallery page** (http://localhost:3001)
   - All 26 demo cards render
   - Each card links to the correct demo page
   - NavBar shows all 26 links with correct active state highlighting

3. **Interactive demo testing** - For each of the 26 demos, navigate to the page and verify:
   - Page loads without errors (check browser console)
   - AG Grid renders with correct data (8 stock rows for most demos)
   - Buttons/controls work as described
   - Key AG Grid features function (sorting, filtering, editing, etc.)

4. **Critical demos requiring deeper testing:**
   - **Demo 03 (Cell Flash)**: Click "Update Price" - cells should flash on change
   - **Demo 05 (Grouping)**: Rows grouped by sector, grand total at bottom, drag-drop grouping panel
   - **Demo 10 (WebSocket)**: Start streaming - prices update every 2s via WebSocket (or local fallback).
     Badge should show "WebSocket" or "Local fallback". Notifications appear for large moves.
   - **Demo 13 (Transaction API)**: Click Add/Update/Remove - status badge should show
     `applyTransaction({ add/update/remove })` confirming real AG Grid API usage
   - **Demo 17 (Tree Data)**: Hierarchical file/folder structure with expand/collapse
   - **Demo 19 (Status Bar)**: Select cells with click+drag - aggregation panel should show sum/avg/min/max
   - **Demo 20 (Overlays)**: Click "Load Data" - loading overlay shows for 2s, then data appears.
     Click "Clear" during loading - should cancel and show no-rows overlay.
   - **Demo 21 (CRUD)**: Should load data from FastAPI backend (badge shows "API").
     Add/delete/edit rows - changes should go through the API.
     Invalid edits (empty name, bad email) should be rejected and reverted.
   - **Demo 26 (Quick Filter)**: Type in search box - rows filter instantly

5. **Backend API testing** (http://localhost:8001):
   - GET / - should return {"app": "AG Grid Demo API", "status": "running"}
   - GET /health - should return {"status": "ok"}
   - GET /api/crud/employees - should return 5 employees
   - POST /api/crud/employees with invalid data (empty name, bad email, negative salary) - should return 422
   - POST /api/validation/validate with {"field": "unknown", "value": "x"} - should return valid=false
   - POST /api/validation/validate with {"field": "price", "value": "nan"} - should return valid=false
   - WebSocket ws://localhost:8001/ws/stream - should stream price updates every 2s

6. **Cross-demo navigation testing:**
   - Demo 04 (Jump & Highlight): Click "Jump to AAPL" - should navigate to Demo 10 and highlight the AAPL row

7. **Report format:**
   For each demo, report: PASS / FAIL with details of any failures.
   At the end, provide a summary: X/26 PASS, list any failures with reproduction steps.

**Known acceptable issues:**
- AG Grid Enterprise license warnings in console (expected for trial/demo usage)
- Only console errors from AG Grid license are acceptable; any React errors or uncaught exceptions are failures

Install playwright-cli if you want browser automation:
npx skills add https://github.com/microsoft/playwright-cli --skill playwright-cli --yes
```
