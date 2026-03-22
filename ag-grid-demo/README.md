# AG Grid Demo

AG Grid Enterprise feature demos built with Next.js 16 + FastAPI, converted from the original Reflex-based `reflex_ag_grid` package.

## 26 Feature Demos

| # | Demo | Description | Backend |
|---|------|-------------|---------|
| 01 | Context Menu | Right-click custom context menus | No |
| 02 | Range Selection | Multi-cell range selection | No |
| 03 | Cell Flash | Flash cells on value change | No |
| 04 | Jump & Highlight | Cross-page navigation with highlight | No |
| 05 | Grouping | Row grouping with aggregation | No |
| 06 | Notifications | Event-driven notification system | No |
| 07 | Validation | Schema-based input validation | Client-side (API available) |
| 08 | Clipboard | Copy/paste with custom formatting | No |
| 09 | Excel Export | Export grid data to Excel/CSV | No |
| 10 | WebSocket | Real-time data streaming | WebSocket (local fallback) |
| 11 | Cell Editors | Custom cell editor components | No |
| 12 | Edit Pause | Pause/resume editing mode | No |
| 13 | Transaction API | Delta row updates via `applyTransaction()` | No |
| 14 | Background Tasks | Scheduled interval updates | Client-side (API available) |
| 15 | Column State | Save/restore column layout | localStorage |
| 16 | Cell Renderers | Custom cell styling via `cellStyle` | No |
| 17 | Tree Data | Hierarchical tree data display | No |
| 18 | Performance | 1000+ row stress test with CRUD | No |
| 19 | Status Bar | Aggregation panels with cell selection | No |
| 20 | Overlays | Loading and no-rows overlays | No |
| 21 | CRUD | Full CRUD with validated REST API | REST API (local fallback) |
| 22 | Advanced Filter | Enterprise filter builder UI | No |
| 23 | Set Filter | Set filter with checkboxes | No |
| 24 | Multi Filter | Combined filter types (accordion) | No |
| 25 | Row Numbers | Automatic row numbering | No |
| 26 | Quick Filter | Global text search across all columns | No |

### Backend integration notes

- **Demos 10 and 21** connect to FastAPI when available and fall back to local simulation/state if the backend is not running. A badge in the UI shows the active mode.
- **Demos 07 and 14** validate/update client-side for instant feedback. The backend exposes equivalent endpoints (`/api/validation/validate`, `/api/background/*`) for external consumers.
- **All other demos** are fully client-side and require no backend.

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:3001
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Backend API endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/ws/stream` | WebSocket | Real-time price streaming (Demo 10) |
| `/api/crud/employees` | GET, POST | List / create employees (Demo 21) |
| `/api/crud/employees/{id}` | PATCH, DELETE | Update / delete employee (Demo 21) |
| `/api/crud/employees/reset` | POST | Reset to seed data (Demo 21) |
| `/api/validation/validate` | POST | Validate a cell value (Demo 07) |
| `/api/validation/rules` | GET | Get validation rule definitions |
| `/api/background/start` | POST | Start background price updates (Demo 14) |
| `/api/background/stop` | POST | Stop background updates |
| `/api/background/updates` | GET | Poll pending price updates |
| `/api/background/status` | GET | Check task status |
| `/health` | GET | Health check |

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, AG Grid 33 React (Enterprise), Tailwind CSS
- **Backend**: FastAPI, Python 3.12, WebSockets, Pydantic v2 (with field validators)
- **Theme**: Catppuccin Mocha dark theme with AG Grid Quartz
