# Technology Selection

Portfolio Management Tool currently uses:

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Grid runtime | AG Grid Community/Enterprise 35.0.1 |
| Desktop | Tauri v2, Rust, PyInstaller FastAPI sidecar |
| Backend | FastAPI, Pydantic, SQLAlchemy, fastapi-users |
| Business logic | `pmt_core_pkg/pmt_core` shared services and repositories |
| Databases | SQLite for local parity/desktop; PostgreSQL optional via `DATABASE_URL` |
| API contract | OpenAPI + `@hey-api/openapi-ts` generated TypeScript client |
| Testing | Pytest for backend; Jest and React Testing Library for frontend |
| Tooling | `uv`, `pnpm`, ESLint, Ruff |

## Current Notes

- Next.js is pinned to 16.0.8 in `nextjs-frontend/package.json`.
- The frontend client is regenerated with `pnpm generate-client` from a
  running FastAPI backend.
- AG Grid Enterprise is installed for parity with Reflex. License
  procurement remains out of scope unless reprioritized.
- SQLite is the default documented path for local parity checks because
  it avoids requiring a PostgreSQL service.
