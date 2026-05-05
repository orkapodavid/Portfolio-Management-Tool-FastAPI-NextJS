# Recommendation for Extending Portfolio Management Tool to Web, Desktop, and Mobile with Tauri

## Final Recommendation

The repository now follows the desktop-first Tauri recommendation:

- Keep **FastAPI** as the backend.
- Keep **Next.js** as the UI stack.
- Keep the normal **web deployment** intact.
- Add **Tauri v2** under `nextjs-frontend/src-tauri` as a thin desktop shell.
- Treat **mobile** as a later wrapper around the remote FastAPI API, not an embedded Python target.

## Shipped Architecture

| Platform | UI runtime | Backend runtime | Current status |
|---|---|---|---|
| Web | Next.js 16 App Router | Existing FastAPI service | Implemented and verified |
| Desktop | Tauri v2 + Next.js static export | Local FastAPI sidecar binary | Implemented and verified |
| Mobile | Static client shell | Remote FastAPI API | Deferred |

## What Changed

### Frontend runtime boundary

The desktop blocker was static-export incompatibility, so the frontend moved away from dynamic server-only features in the shared auth and mutation paths.

- `TAURI_BUILD=1` switches `nextjs-frontend/next.config.mjs` to `output: "export"` and unoptimized images.
- `app/page.tsx` and `app/dashboard/page.tsx` now use client redirects instead of server redirects.
- `app/dashboard/market-data/market-data/page.tsx` now loads on the client and no longer uses `cookies()` or `redirect()`.
- The former Server Action files in `components/actions/*.ts` are now client-callable helpers that validate form data and call the generated OpenAPI client directly.

### Auth strategy

The implementation kept a split storage strategy with one shared client-side flow:

- Web stores the JWT in a browser cookie named `accessToken`.
- Desktop stores the JWT in `localStorage`.
- Protected dashboard routes use a client auth gate that validates the token via `GET /users/me`, and the entire dashboard shell is now gated instead of only `<main>`.
- The web cookie is now written with explicit `Path=/`, `Max-Age`, `SameSite=Lax`, and `Secure` on HTTPS.

Because Next.js static export does not support Proxy, the old `proxy.ts` guard was removed and replaced with the shared client guard.

### Runtime config

Browser-consumed API configuration no longer depends on a server-only env var.

- Web uses `NEXT_PUBLIC_API_BASE_URL`.
- Desktop uses a Tauri command, `get_runtime_config`, to return `{ apiBaseUrl, desktopTarget }`.
- Tauri dev/build flows inject `NEXT_PUBLIC_DESKTOP_TARGET=1`.
- The desktop fallback base URL is `http://127.0.0.1:18475`.

## Desktop Sidecar Strategy

### Rust shell

`nextjs-frontend/src-tauri/src/lib.rs` is the Tauri startup layer.

- It launches the `pmt-backend` sidecar from Rust with the shell plugin.
- It injects the selected local port through `PORT`.
- It waits for `GET /api/health` before finishing setup.
- It exposes `get_runtime_config` to the frontend.
- It kills the sidecar when the app exits.

### Python runtime

`fastapi_backend/commands/run_tauri_sidecar.py` is the desktop launcher.

- Source-run desktop startup uses the desktop bootstrap plus Alembic migrations.
- Frozen desktop startup now also runs real Alembic upgrades using the bundled migration assets and config, so existing desktop SQLite installs are upgraded instead of only getting first-run table creation.
- `GET /api/health` reports:
  - `status`
  - `runtime`
  - `database_backend`

### Desktop defaults

The sidecar runtime now has a concrete first-pass local desktop story:

- Default port: `18475`
- Default host: `127.0.0.1`
- Default runtime mode: `desktop`
- Default app data dir: `~/.portfolio-management-tool`
- Default desktop database: SQLite at `~/.portfolio-management-tool/portfolio-management-tool.sqlite3`
- Default desktop secret persistence: `desktop-runtime.json` inside the app data dir
- Default desktop CORS origins:
  - `tauri://localhost`
  - `http://tauri.localhost`
  - `https://tauri.localhost`
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://localhost:1420`
  - `http://127.0.0.1:1420`

## Packaging Decision

The desktop backend uses Tauri `externalBin`, so the sidecar is packaged as a single executable.

- The build helper is `nextjs-frontend/src-tauri/scripts/build-sidecar.mjs`.
- It uses `uv run --with pyinstaller pyinstaller --onefile`.
- It emits the current-platform binary into `nextjs-frontend/src-tauri/binaries/pmt-backend-$TARGET_TRIPLE`.
- It reuses the existing binary when neither backend sources nor backend dependency/config manifests have changed.
- Rebuild invalidation now includes at least:
  - `fastapi_backend/pyproject.toml`
  - `fastapi_backend/requirements.txt`
  - `fastapi_backend/uv.lock`
  - `fastapi_backend/alembic.ini`
  - the sidecar build script itself

## Verification Summary

The implementation was validated with:

- web build
- desktop/static export build
- Jest frontend tests
- backend Ruff + pytest checks
- Cargo check
- frozen sidecar binary health smoke test, including:
  - upgrade from the older desktop SQLite revision to head
  - upgrade from a legacy desktop SQLite database with an empty `alembic_version` table
- `pnpm --dir nextjs-frontend tauri dev` startup smoke test with successful desktop health polling on `http://127.0.0.1:18475/api/health`

## Deferred Work

- Mobile packaging remains intentionally deferred.
- The dev flow still emits third-party `baseline-browser-mapping` / `caniuse-lite` freshness warnings; these are environmental package warnings, not application failures.
