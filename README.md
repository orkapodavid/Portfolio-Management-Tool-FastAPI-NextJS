# Portfolio Management Tool

A professional financial portfolio management dashboard built with **Next.js 16** (frontend) and **FastAPI** (backend), powered by the `pmt_core` business logic package.

## Architecture

```
Portfolio-Management-Tool/
├── nextjs-frontend/          # Next.js 16 + TypeScript + Tailwind CSS
│   ├── app/dashboard/        # Module pages (11 modules, 40+ pages)
│   ├── components/layout/    # Top nav, performance header, subtabs, data table
│   └── lib/                  # Constants, types, utilities
├── fastapi_backend/          # FastAPI + pmt_core services
│   └── app/routes/           # API routes for all PMT modules
├── pmt_core_pkg/             # Business logic (framework-agnostic)
│   └── pmt_core/
│       ├── models/           # TypedDict data models + enums
│       ├── services/         # 18+ business logic services
│       └── repositories/     # Data access layer
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
- Node.js 20+ with pnpm
- Python 3.12+ with uv
- PostgreSQL 17 (or use Docker)

### Development

```bash
# Start database
docker compose up db -d

# Backend
cd fastapi_backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd nextjs-frontend
pnpm install
pnpm dev
```

### Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.12, SQLAlchemy, asyncpg |
| Auth | fastapi-users (JWT) |
| Business Logic | pmt_core (models, services, repositories) |
| Database | PostgreSQL 17 |
| API Contract | OpenAPI + @hey-api/openapi-ts (auto-generated typed client) |
| Dev Tools | Docker Compose, uv, pnpm, ESLint, Ruff |

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
