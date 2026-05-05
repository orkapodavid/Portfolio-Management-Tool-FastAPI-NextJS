# Portfolio Management Tool

A professional portfolio dashboard built with **Next.js 16** (frontend), **FastAPI** (backend), and a **Tauri v2** desktop shell. Shared business logic lives in `pmt_core_pkg/pmt_core`.

## Architecture

```text
Portfolio-Management-Tool/
├── nextjs-frontend/          # Next.js 16 + TypeScript + Tailwind CSS
│   ├── app/                  # Routes, login/register flows, dashboard pages
│   ├── components/           # Layout, auth gate, UI primitives
│   ├── lib/                  # Runtime config, auth/token helpers, utilities
│   └── src-tauri/            # Tauri v2 desktop shell + sidecar builder
├── fastapi_backend/          # FastAPI API + desktop sidecar launcher
│   ├── app/                  # Config, runtime bootstrap, routes, models
│   └── commands/             # OpenAPI generation + Tauri sidecar entrypoint
├── pmt_core_pkg/             # Framework-agnostic business logic
└── docker-compose.yml        # PostgreSQL + Backend + Frontend + MailHog
```

## Modules

| Module | Description |
|--------|-------------|
| **Market Data** | Real-time prices, FX rates, historical data, trading calendar |
| **Positions** | Stock/Warrant/Bond holdings, trade summary |
| **P&L** | YTD/MTD/DTD P&L, currency breakdown, full detail |
| **Risk** | Delta/Gamma/Vega/Theta Greeks, risk measures |
| **Recon** | PPS, settlement, failed trades, P&L recon |
| **Compliance** | Restricted list, undertakings, beneficial ownership |
| **Tools** | Pay-to-hold, stock borrow, resets, installments |
| **Instruments** | Ticker data, stock screener, special terms |
| **Events** | Event calendar, event stream, reverse inquiry |
| **Operations** | Daily procedures, operation processes |
| **Orders** | EMSX order management, routing |

## Quick Start

### Prerequisites

- Node.js 20+ with `pnpm`
- Python 3.12+ with `uv`
- Rust toolchain (`rustup`, `cargo`)
- PostgreSQL 17 for the normal web/backend path, or Docker

### Web Development

```bash
# Database
docker compose up db -d

# Backend
cd fastapi_backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd ../nextjs-frontend
pnpm install
pnpm dev
```

Web frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### Desktop Development

```bash
cd nextjs-frontend
pnpm install
pnpm tauri dev
```

What `pnpm tauri dev` does:

- builds or reuses the current-platform sidecar binary
- runs the Next dev server with desktop env injected
- launches the Tauri shell
- starts the local FastAPI sidecar and waits for `/api/health`

### Desktop Static Export Build

```bash
TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm --dir nextjs-frontend build
```

### Docker

```bash
docker compose up --build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Desktop Shell | Tauri v2, Rust, tauri-plugin-shell |
| Backend | FastAPI, Python 3.12, SQLAlchemy, asyncpg, aiosqlite |
| Auth | fastapi-users (JWT) |
| Business Logic | pmt_core (models, services, repositories) |
| Database | PostgreSQL 17 (web), SQLite sidecar fallback (desktop) |
| API Contract | OpenAPI + @hey-api/openapi-ts (auto-generated typed client) |
| Dev Tools | Docker Compose, uv, pnpm, Cargo, ESLint, Ruff |

## Runtime Config

### Frontend env

See `nextjs-frontend/.env.example`.

- `NEXT_PUBLIC_API_BASE_URL` is the web API base URL.
- `NEXT_PUBLIC_DESKTOP_TARGET` and `NEXT_PUBLIC_DESKTOP_API_BASE_URL` are injected automatically by the desktop scripts.
- `OPENAPI_OUTPUT_FILE` is used for generated client output.

### Desktop sidecar defaults

- host: `127.0.0.1`
- port: `18475`
- app data dir: `~/.portfolio-management-tool`
- health endpoint: `GET /api/health`

Optional desktop overrides:

- `PMT_SIDECAR_PORT`
- `PMT_SIDECAR_HEALTH_TIMEOUT_MS`
- `PMT_SIDECAR_WORKDIR`
- `PMT_APP_DATA_DIR`
- `PMT_DESKTOP_APP_DATA_DIR`

## Auth and Protection

- Web stores the access token in a browser cookie.
- Desktop stores the access token in `localStorage`.
- Dashboard routes are protected by a client auth gate that validates the token via `/users/me`.
- Login, register, password reset, add-item, and delete-item flows call the FastAPI API directly through the generated OpenAPI client.

## API Endpoints

All PMT endpoints are under `/api/`:

- `GET /api/positions/` - All positions
- `GET /api/positions/stocks` - Stock positions
- `GET /api/pnl/changes` - P&L changes
- `GET /api/pnl/summary` - P&L summary
- `GET /api/market-data/` - Market data
- `GET /api/market-data/fx` - FX rates
- `GET /api/risk/measures` - Risk measures
- `GET /api/compliance/restricted-list` - Restricted list
- `GET /api/recon/pps` - PPS reconciliation
- `GET /api/portfolio-tools/pay-to-hold` - Pay to hold
- `GET /api/instruments/ticker-data` - Ticker data
- `GET /api/events/calendar` - Event calendar
- `GET /api/operations/daily-procedures` - Daily procedures
- `GET /api/orders/` - EMSX orders

Auth endpoints (from template):
- `POST /auth/jwt/login` - Login
- `POST /auth/register` - Register
- `GET /api/health` - Desktop sidecar readiness
