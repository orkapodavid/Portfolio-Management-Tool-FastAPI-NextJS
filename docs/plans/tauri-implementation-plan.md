# Tauri v2 Implementation Plan for Portfolio Management Tool

This file now records the implemented desktop-first Tauri architecture instead of a proposed future state.

## 1. Final State

### Frontend

- `nextjs-frontend/src-tauri/` exists and is the Tauri project root.
- `nextjs-frontend/next.config.mjs` enables static export only when `TAURI_BUILD=1`.
- Shared auth and mutation flows no longer depend on Server Actions.
- Dashboard protection uses a client auth gate instead of server-side `cookies()` checks.
- Browser API configuration uses a runtime bridge, not a server-only env variable.

### Backend

- `fastapi_backend/commands/run_tauri_sidecar.py` is the desktop launcher.
- `fastapi_backend/app/routes/health.py` exposes `GET /api/health`.
- Desktop runtime bootstrap lives in `fastapi_backend/app/runtime.py`.
- Desktop defaults use SQLite plus per-user persisted secrets.
- The same backend code still supports the normal web/server path.

### Desktop shell

- Rust startup lives in `nextjs-frontend/src-tauri/src/lib.rs`.
- The shell launches the sidecar, waits for health, exposes runtime config, and stops the child on exit.
- Tauri bundle config uses `externalBin` with `binaries/pmt-backend`.

## 2. Build and Runtime Contracts

### Web

- Build command: `pnpm --dir nextjs-frontend build`
- API base URL env: `NEXT_PUBLIC_API_BASE_URL`

### Desktop static export

- Build command: `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm --dir nextjs-frontend build`
- `next.config.mjs` switches to static export under `TAURI_BUILD=1`

### Tauri

- Dev command: `pnpm --dir nextjs-frontend tauri dev`
- Rust check: `cargo check --manifest-path nextjs-frontend/src-tauri/Cargo.toml`
- The Tauri Next wrapper is `nextjs-frontend/src-tauri/scripts/run-next-with-tauri-env.mjs`
- The sidecar builder is `nextjs-frontend/src-tauri/scripts/build-sidecar.mjs`

## 3. Auth and Route Protection

### Login and session persistence

- `components/actions/login-action.ts` validates credentials and stores the JWT through the client token adapter.
- Web storage: cookie
- Desktop storage: `localStorage`

### Protected routes

- `components/auth/dashboard-auth-gate.tsx` is the route-entry guard.
- It checks for a stored token and validates it via `/users/me`.
- Missing or invalid tokens redirect the user to `/login`.
- `app/dashboard/layout.tsx` now wraps the entire dashboard shell in the auth gate, so unauthenticated users do not render dashboard chrome before redirect.

### Logout

- `components/actions/logout-action.ts` clears the stored token and calls the backend logout endpoint.
- The top navigation user button triggers logout.

## 4. Backend Desktop Runtime

### Desktop defaults

| Setting | Value |
|---|---|
| Host | `127.0.0.1` |
| Port | `18475` |
| Runtime mode | `desktop` |
| App data dir | `~/.portfolio-management-tool` |
| Desktop DB | SQLite |
| Health path | `/api/health` |

### Supported env overrides

- `PORT`
- `PMT_PORT`
- `HOST`
- `PMT_HOST`
- `PMT_APP_DATA_DIR`
- `PMT_DESKTOP_APP_DATA_DIR`
- `PMT_SKIP_MIGRATIONS`
- `PMT_SIDECAR_PORT`
- `PMT_SIDECAR_HEALTH_TIMEOUT_MS`
- `PMT_SIDECAR_WORKDIR`

### Schema initialization behavior

- Source desktop launcher path: bootstrap + Alembic upgrade
- Frozen desktop binary path: bootstrap + Alembic upgrade using the bundled `alembic.ini` and `alembic_migrations/` assets
- Legacy desktop SQLite databases with an empty `alembic_version` table are stamped before upgrade so older frozen installs can move forward safely
- First-launch desktop SQLite databases still work because the full migration chain can build a fresh schema from revision zero to head

## 5. Sidecar Packaging

### Binary output

- Output directory: `nextjs-frontend/src-tauri/binaries/`
- Filename pattern: `pmt-backend-$TARGET_TRIPLE`

### Build strategy

- Build tool: PyInstaller one-file executable
- Invocation path: `uv run --with pyinstaller pyinstaller`
- The builder adds backend runtime data, migrations, and package paths needed by the frozen sidecar

### Dev-loop behavior

- The sidecar builder now reuses the current binary when backend sources and backend dependency/config manifests are unchanged.
- That keeps `tauri dev` from forcing a needless second rebuild just because the sidecar file timestamp changed.
- Invalidation now covers:
  - `fastapi_backend/pyproject.toml`
  - `fastapi_backend/requirements.txt`
  - `fastapi_backend/uv.lock`
  - `fastapi_backend/alembic.ini`
  - the sidecar build script itself

## 6. Verification Runbook

The strongest checks that were run against the implemented repo were:

### Frontend

- `pnpm --dir nextjs-frontend exec tsc --noEmit`
- `pnpm --dir nextjs-frontend exec jest --runInBand`
- `pnpm --dir nextjs-frontend build`
- `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm --dir nextjs-frontend build`

### Backend

- `uv --directory fastapi_backend run ruff check app/config.py app/database.py app/main.py app/models.py app/routes/health.py app/runtime.py commands/run_tauri_sidecar.py alembic_migrations/env.py alembic_migrations/versions/b389592974f8_add_item_model.py`
- `TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/fastapi_backend/.pytest-sqlite.sqlite3 uv --directory fastapi_backend run pytest tests/test_database.py tests/main/test_main.py`

### Desktop runtime

- `cargo check --manifest-path nextjs-frontend/src-tauri/Cargo.toml`
- `node nextjs-frontend/src-tauri/scripts/build-sidecar.mjs`
- Frozen sidecar binary health smoke test against `http://127.0.0.1:18476/api/health`, including:
  - an upgrade from revision `402d067a8b92` to head
  - an upgrade from a legacy desktop SQLite database with an empty `alembic_version` table
- `pnpm --dir nextjs-frontend tauri dev` with successful health polling on `http://127.0.0.1:18475/api/health`
- `pnpm --dir nextjs-frontend tauri build --debug` completed static export, Rust compilation, `.app` bundling, and DMG packaging, producing both the macOS app bundle and the debug DMG

## 7. Known Limitations

- Third-party browser-data freshness warnings from `baseline-browser-mapping` / `caniuse-lite` remain informational and were not blocking any required build.

## 8. Lockfile Hygiene

- The repo pins pnpm via `packageManager` in `nextjs-frontend/package.json`, and `pnpm-lock.yaml` is the single source of truth for frontend installs.
- A stale `nextjs-frontend/package-lock.json` was carried from the original npm-based setup. It invited `npm install`, which overwrote the pnpm virtual store with real directory copies. That corrupted `.pnpm/<pkg>/node_modules/chokidar` (making them full directories instead of symlinks to `.pnpm/chokidar@<ver>/node_modules/chokidar`), so the embedded chokidar@3.6.0 inside `fork-ts-checker-webpack-plugin` resolved `require('readdirp')` via node's upward walk to the hoisted `.pnpm/node_modules/readdirp@4.0.2`, whose default export is no longer callable. That was the `readdirp is not a function` rejection `tauri dev` emitted during webpack watcher init.
- The fix is to keep only `pnpm-lock.yaml` and reinstall with `pnpm install --frozen-lockfile` if the virtual store ever contains real-directory chokidar entries again.
