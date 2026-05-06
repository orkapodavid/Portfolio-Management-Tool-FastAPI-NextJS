# Changelog

This project tracks high-level milestones for the Next.js 16 + FastAPI +
Tauri parity rebuild of the Reflex Portfolio Management Tool. For
session-by-session work and exact verification results, see
[`continuations.md`](continuations.md). Per-defect history lives in
`git log`.

## 0.1.0 - Initial parity rebuild

- Next.js 16 (App Router, React 19) frontend with AG Grid Community/
  Enterprise 35.0.1, Tailwind, and a generated `@hey-api/openapi-ts`
  client.
- FastAPI backend serving 14 PMT modules (positions, P&L, market data,
  risk, compliance, reconciliation, portfolio tools, instruments,
  events, operations, orders, performance, notifications) plus
  fastapi-users JWT auth and a legacy `/items` CRUD surface.
- Shared business logic in `pmt_core_pkg/pmt_core` consumed by FastAPI
  routes; mock data ships by default (`MOCK_DATA=true`).
- Tauri v2 desktop shell with a PyInstaller FastAPI sidecar bound to
  `127.0.0.1:18475` and an app-data SQLite database.
- SQLite is the default local-development backend; PostgreSQL is
  supported via `DATABASE_URL` for composed environments.
- Authentication is disabled by default for local web and desktop runs.
  Set `PMT_AUTH_DISABLED=false` and `NEXT_PUBLIC_AUTH_DISABLED=0` to
  exercise the JWT flow.
- Milestone B and Milestone C parity gates closed through
  implementation HEAD `82142c9`. F-7, F-21, F-23, F-35, and F-36 are
  closed. F-9 (3-D pricer chart), F-27 (mobile responsive nav), F-28
  (Reflex ticker-data divergence), and AG Grid Enterprise license
  procurement remain intentional out-of-scope deltas.
