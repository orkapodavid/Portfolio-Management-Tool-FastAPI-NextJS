# Backend API Reference

This page summarizes the HTTP surface exposed by the FastAPI backend.
The **live OpenAPI schema is the source of truth**: hit
`http://127.0.0.1:8000/openapi.json` (or browse Swagger UI at
`/docs`) for the exact request/response shapes, and run
`pnpm generate-client` from `nextjs-frontend/` to refresh the
TypeScript bindings whenever something here changes.

## Auth Behavior at a Glance

- All `/api/*`, `/users/*`, and `/items/*` routes go through PMT's
  `current_active_user` dependency.
- When `AUTH_DISABLED` is `true` (the default for local dev and the
  Tauri desktop sidecar), every protected route accepts unauthenticated
  requests and the handler sees a synthetic user with id
  `00000000-0000-0000-0000-0000000000a1`.
- When `AUTH_DISABLED` is `false`, requests must carry a Bearer JWT
  obtained from `POST /auth/jwt/login`.
- The pytest suite forces `AUTH_DISABLED=False` so 401 / 403 paths stay
  exercised regardless of the application default.

Unless noted otherwise, every endpoint below returns JSON.

---

## Health

### `GET /api/health`

Reports runtime mode and database backend. No auth required.

```json
{
  "status": "ok",
  "runtime": "server",
  "database_backend": "sqlite"
}
```

`runtime` is `"server"` for `uvicorn`/dev/CI runs and `"desktop"` for
the Tauri-launched PyInstaller sidecar. `database_backend` is parsed
from `DATABASE_URL` (`"sqlite"`, `"postgresql"`, ...).

---

## Authentication (`fastapi-users`)

The `fastapi-users` JWT backend is mounted under `/auth`. Operation IDs
are stripped of their tag prefix so the generated TypeScript client
exposes clean method names.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/auth/jwt/login` | Exchange `username` (email) + `password` form-data for a JWT |
| `POST` | `/auth/jwt/logout` | Invalidate the current token; returns `{"detail": "Successfully logged out"}` |
| `POST` | `/auth/register` | Create a new user (`email`, `password`) |
| `POST` | `/auth/forgot-password` | Trigger a reset email; always returns 202 |
| `POST` | `/auth/reset-password` | Confirm reset using `{token, password}` |
| `POST` | `/auth/verify` | Verify email with token |
| `POST` | `/auth/request-verify-token` | Send a fresh verification email |

### Login

```http
POST /auth/jwt/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=Secret1!
```

Successful response:

```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### Password rules (`UserManager.validate_password`)

- Minimum 8 characters
- Must not contain the user's email
- At least one uppercase letter
- At least one of `!@#$%^&*(),.?":{}|<>`

Failures are returned as `400` with a list of reasons.

---

## Users

Mounted under `/users`. Provided by `fastapi-users`.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/users/me` | Current authenticated user |
| `PATCH` | `/users/me` | Update the current user (any field optional) |
| `GET` | `/users/{id}` | Fetch any user by UUID (superuser only) |
| `PATCH` | `/users/{id}` | Update any user (superuser only) |
| `DELETE` | `/users/{id}` | Delete a user; cascades to `items` (superuser only) |

Standard `UserRead` shape:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": true
}
```

---

## Items (legacy template surface)

The `/items` router is inherited from the FastAPI/Next.js full-stack
template. PMT does not use it for domain data, but it is still wired
up because the User model owns a one-to-many `items` relationship.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/items/?page=1&size=10` | Paginated `Page[ItemRead]` response (`fastapi-pagination`); `size` is clamped to 1-100 |
| `POST` | `/items/` | Create an item owned by the current user |
| `DELETE` | `/items/{item_id}` | Delete an owned item; 404 if missing or not owned |

`ItemRead`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Example Item",
  "description": "Optional",
  "quantity": 5,
  "user_id": "660e8400-e29b-41d4-a716-446655440000"
}
```

---

## PMT Modules

Each PMT router is a thin wrapper around services in
`pmt_core_pkg/pmt_core`. Most endpoints accept optional
`position_date` / `start_date` / `end_date` query parameters in
`YYYY-MM-DD`, validated by `app.routes._validation.validate_date`.
Response shapes mirror the corresponding `pmt_core` TypedDicts.

Refer to `/docs` for full per-endpoint schemas. The tables below are
the inventory.

### Positions - `/api/positions`

| Method | Path | Query | Description |
|---|---|---|---|
| `GET` | `/api/positions/` | `position_date?` | All positions |
| `GET` | `/api/positions/stocks` | `position_date?` | Stock subset |
| `GET` | `/api/positions/warrants` | `position_date?` | Warrant subset |
| `GET` | `/api/positions/bonds` | `position_date?` | Bond subset |
| `GET` | `/api/positions/trade-summary` | `start_date?`, `end_date?` | Trade summary in range |

### P&L - `/api/pnl`

| Method | Path | Query |
|---|---|---|
| `GET` | `/api/pnl/changes` | `position_date?` |
| `GET` | `/api/pnl/summary` | `position_date?` |
| `GET` | `/api/pnl/currency` | `position_date?` |
| `GET` | `/api/pnl/full` | `position_date?` |
| `GET` | `/api/pnl/kpi` | KPI cards |

### Market Data - `/api/market-data`

| Method | Path |
|---|---|
| `GET` | `/api/market-data/` |
| `GET` | `/api/market-data/fx` |
| `GET` | `/api/market-data/top-movers` |
| `GET` | `/api/market-data/trading-calendar` |
| `GET` | `/api/market-data/market-hours` |
| `GET` | `/api/market-data/ticker` |
| `GET` | `/api/market-data/historical` |
| `GET` | `/api/market-data/stock/{symbol}` |
| `GET` | `/api/market-data/stock/{symbol}/history` |
| `GET` | `/api/market-data/stock/{symbol}/news` |

### Risk - `/api/risk`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/risk/delta-change` | Delta change grid |
| `GET` | `/api/risk/measures` | Risk measures grid |
| `GET` | `/api/risk/inputs` | Risk input data |
| `POST` | `/api/risk/pricer/warrant` | Warrant pricer; returns `WarrantPricerOutput` |
| `POST` | `/api/risk/pricer/bond` | Bond pricer; returns `BondPricerOutput` |

The 3-D Plotly chart on Reflex's pricer pages (F-9) is intentionally
out of scope on this side; numeric outputs match because both apps
wrap `pmt_core.services.pricing.{WarrantPricer, BondPricer}`.

### Compliance - `/api/compliance`

| Method | Path |
|---|---|
| `GET` | `/api/compliance/restricted-list` |
| `GET` | `/api/compliance/undertakings` |
| `GET` | `/api/compliance/beneficial-ownership` |
| `GET` | `/api/compliance/monthly-exercise-limit` |

### Reconciliation - `/api/recon`

| Method | Path |
|---|---|
| `GET` | `/api/recon/pps` |
| `GET` | `/api/recon/settlement` |
| `GET` | `/api/recon/failed-trades` |
| `GET` | `/api/recon/pnl` |
| `GET` | `/api/recon/risk-input` |

### Portfolio Tools - `/api/portfolio-tools`

| Method | Path |
|---|---|
| `GET` | `/api/portfolio-tools/pay-to-hold` |
| `GET` | `/api/portfolio-tools/stock-borrow` |
| `GET` | `/api/portfolio-tools/reset-dates` |
| `GET` | `/api/portfolio-tools/coming-resets` |
| `GET` | `/api/portfolio-tools/cb-installments` |
| `GET` | `/api/portfolio-tools/excess-amount` |
| `GET` | `/api/portfolio-tools/deal-indication` |
| `GET` | `/api/portfolio-tools/po-settlement` |
| `GET` | `/api/portfolio-tools/short-ecl` |

### Instruments - `/api/instruments`

| Method | Path |
|---|---|
| `GET` | `/api/instruments/ticker-data` |
| `GET` | `/api/instruments/stock-screener` |
| `GET` | `/api/instruments/special-terms` |
| `GET` | `/api/instruments/instrument-data` |
| `GET` | `/api/instruments/instrument-term` |

### Events - `/api/events`

| Method | Path |
|---|---|
| `GET` | `/api/events/calendar` |
| `GET` | `/api/events/stream` |
| `GET` | `/api/events/reverse-inquiry` |

### Operations - `/api/operations`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/operations/daily-procedures` | Daily procedure check rows |
| `GET` | `/api/operations/processes` | Operations process list |
| `POST` | `/api/operations/processes/{process_id}/rerun` | Right-click rerun action (Reflex parity) |
| `POST` | `/api/operations/processes/{process_id}/kill` | Right-click kill action |

### Orders - `/api/orders`

| Method | Path |
|---|---|
| `GET` | `/api/orders/` |
| `GET` | `/api/orders/routes` |

### Performance - `/api/performance`

| Method | Path |
|---|---|
| `GET` | `/api/performance/kpi` |
| `GET` | `/api/performance/top-movers` |
| `GET` | `/api/performance/portfolio-holdings` |

### Notifications - `/api/notifications`

| Method | Path | Query |
|---|---|---|
| `GET` | `/api/notifications/` | `category?`, `unread_only` (bool, default `false`), `limit?` (1-200) |

`category` is one of `Alerts`, `Portfolio`, `News`, `System`. The
backend registers six providers at module import time
(`pnl`, `positions`, `risk`, `market_data`, `fx`, `system`).

---

## Errors

PMT does not customize the standard FastAPI / `fastapi-users` error
shape. Common cases:

| Status | When |
|---|---|
| `400` | Invalid login credentials, weak password, already-verified user, etc. |
| `401` | Auth required and the request did not present a valid bearer token |
| `403` | Authenticated but not authorized (e.g. non-superuser hits `/users/{id}`) |
| `404` | Resource not found or not owned by the requesting user |
| `422` | Request validation error (pydantic/path/query) |

The exact error body comes from FastAPI's default exception handlers
or `fastapi-users`. Inspect `/openapi.json` for per-route examples.

---

## Interactive Docs

When the backend is running:

- **Swagger UI** - <http://127.0.0.1:8000/docs>
- **ReDoc** - <http://127.0.0.1:8000/redoc>
- **OpenAPI JSON** - <http://127.0.0.1:8000/openapi.json>

When `pnpm generate-client` runs from `nextjs-frontend/`, it pulls
that JSON, writes `nextjs-frontend/openapi.json`, and regenerates
`nextjs-frontend/app/openapi-client/`.
