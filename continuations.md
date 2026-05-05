# Portfolio Management Tool - Continuation Log

## Current Status (2026-05-05 — Auth-bypass flag for parity work)

### What landed this session

**Backend (1 commit):** `Settings.AUTH_DISABLED` (alias `PMT_AUTH_DISABLED`, default `False`). `current_active_user` now wraps `fastapi_users.current_user(active=True, optional=True)` — when the flag is on it returns a synthetic `User` (id `00000000-0000-0000-0000-0000000000a1`, email `noauth@local`) without consulting the DB; when off, it preserves the existing 401 path. Single point of change — none of the 13 route files touched. New `tests/routes/test_auth_bypass.py` with monkeypatch on `settings.AUTH_DISABLED` brings pytest from **32 → 33 passed**. `fastapi_backend/.env.example` carries a commented `# PMT_AUTH_DISABLED=true` hint.

**Frontend (1 commit):** `NEXT_PUBLIC_AUTH_DISABLED` (default `0`) wired in three places. `getAuthToken()` returns the placeholder string `"no-auth"` when the flag is `1`, so the 50 dashboard pages keep their `if (!token) router.replace("/login")` code path but never redirect. `<DashboardAuthGate>` short-circuits its `useEffect` and renders children immediately, skipping the `/users/me` validation. `TopNavigation` hides the `User`/logout icon so the no-token shell can't accidentally call `logout()`. New `__tests__/authBypass.test.tsx` brings jest from **34 → 35 passed**.

### Verification matrix

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ **11 suites / 35 tests** |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 52 dashboard routes prerender as `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | ✅ PASS |
| Backend pytest (sqlite override) | ✅ **33 passed in 0.45s** |
| Live `curl -i :18476/api/positions/` (no flag, no token) | ✅ **401 Unauthorized** |
| Live `curl :18476/api/positions/` (`PMT_AUTH_DISABLED=true`, no token) | ✅ 200 + JSON list |
| Live `curl :18476/api/notifications/` (`PMT_AUTH_DISABLED=true`, no token) | ✅ 200 + JSON list |
| Live `curl -H 'Authorization: Bearer no-auth' …/api/positions/` (flag on) | ✅ 200 + JSON list |

### Parity workflow with the bypass

```bash
# Terminal 1 — backend with auth bypass + sqlite override
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Next.js with auth bypass
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev   # → http://localhost:3000

# Terminal 3 — Reflex reference
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                       # → http://localhost:3001/pmt/
```

Both env vars must default off again before any release build. The flag is wired only at the two integration points (`current_active_user` on the backend, `<DashboardAuthGate>` + `getAuthToken()` on the frontend) so flipping it back to `0` / removing it restores the old behavior with no further edits.

### What this unblocks

§11 exit criterion #12 — playwright side-by-side captures of the 11 modules into `docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png`. The 6 missing-endpoint scaffolds (`monthly-exercise-limit`, `deal-indication`, `po-settlement`, `short-ecl`, `instrument-data`, `instrument-term`) and the two pricer placeholder pages (`risk/pricer-warrant`, `risk/pricer-bond`) will not match the reflex grids and should be flagged in `docs/parity-screenshots/README.md` as expected deltas.

---

## Previous Status (2026-05-05 — Section D convergence pass)

### What landed this session

**Tauri stack (5 commits, A–E in §9):** backend desktop runtime + health endpoint, DB normalization for postgres/sqlite, frontend client-side auth refactor with `<DashboardAuthGate>`, the `src-tauri/` Rust shell, and the handoff brief + market-data live migration. Then rebased to absorb origin's `1f1f293` baseURL fix.

**Lint cleanup (1 commit):** flat-config fix so `.mjs` scripts run with node globals; `src-tauri/{target,gen}/**` now ignored. `pnpm lint` reports **0 errors / 0 warnings**.

**Section B — layout chrome (5 commits):** top-nav (NAV_BG #333333, blue underline + animate-pulse, lucide icon swap, 9px uppercase labels), subtab-nav (white bg, 28px, 9px uppercase tracking-tighter), notification sidebar (`/api/notifications/` backend, `NotificationsProvider` context, 4-tab filter, mark-read/dismiss, the bell badge wired up), performance header (KPI sparklines, portfolio summary cards, expandable Top Movers grid backed by 5 categories of `/api/market-data/top-movers`).

**Section C — AG Grid foundation (1 commit):** `ag-grid-community`+`ag-grid-react` v35.0.1 (matches the reflex `reflex_ag_grid` pin), `components/grid/data-grid.tsx` wrapper with themeQuartz + toolbar (refresh + search) + error/empty states, `components/grid/columns.ts` typed helpers (textColumn, numberColumn, currencyColumn, percentColumn, integerColumn, dateColumn). `__tests__/dataGrid.test.tsx` brings jest to 10 suites / 34 tests.

**Section D — page convergences (44 commits):** 42 grid pages migrated off mock data onto the live FastAPI client, plus 2 risk pricer scaffolds. The 6 grid-based "new" pages from §6 (monthly-exercise-limit, deal-indication, po-settlement, short-ecl, instrument-data, instrument-term) were scaffolded as Construction-icon placeholders that name the reflex grid + the missing FastAPI endpoint (§8). Subtab order/labels in `lib/constants.ts` now match the reflex reference (Reference Data label, full Portfolio Tools name, expanded subtab lists).

### Verification matrix (post-convergence)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | ✅ clean |
| `pnpm exec jest --runInBand` | ✅ 10 suites / 34 tests / ~0.7s |
| `pnpm lint` | ✅ 0 errors / 0 warnings |
| `pnpm build` (web) | ✅ PASS — 52 dashboard routes prerender as `○ Static` |
| `TAURI_BUILD=1 … pnpm build` | ✅ PASS — `out/` populated |
| Backend pytest | ✅ **32 passed in 0.42s** (was 26; +3 notifications, +3 performance) |
| `grep mockData …/dashboard \| wc -l` | ✅ **0** |
| `cargo check src-tauri/Cargo.toml` | ✅ PASS — 23 crates compiled |
| Branch | `feat/nextjs-fastapi-rebuild` fully pushed to origin |

### Open issues / what's NOT done

1. **Pricer · Warrant / Pricer · Bond placeholder.** The reflex reference at `components/risk/pricer_{warrant,bond}_view.py` ships a 21-field Terms / Simulations / Outputs / chart layout. Scaffolded as Construction-icon placeholders; the form-based ports are queued.
2. **6 missing-endpoint scaffolds.** `monthly-exercise-limit`, `deal-indication`, `po-settlement`, `short-ecl`, `instrument-data`, `instrument-term` exist as routes + subtabs but render placeholders. §8 of the brief lists the FastAPI endpoints to add (`pmt_core.repositories.*` doesn't yet have a `risk` repository for the pricer pages — that's the larger blocker).
3. **§11 exit criterion #12 — parity screenshots.** Not yet captured. Reflex (`localhost:3001/pmt/`) and Next.js (`localhost:3000`) are both up; the brief calls for one screenshot per module saved under `docs/parity-screenshots/`. Skipped because it requires a logged-in playwright session and cosmetic differences are expected for the placeholder pages.
4. **`compliance/beneficial-ownership` field mismatch.** The reflex grid expects `nosh_reported / nosh_bbg / nosh_proforma / stock_shares / warrant_shares / bond_shares / total_shares`; the FastAPI stub currently returns the shared restricted-list / undertakings shape. Cells render empty until `pmt_core.repositories.compliance` emits the expected fields.
5. **Backend pytest count question (§17.1).** Brief notes a previous `116/116` count vs today's 32. I did not restore route-level tests beyond the new ones I added (`test_notifications.py`, `test_performance.py`); leaving that for the user to decide.

### Local dev DB workaround

`fastapi_backend/.env` ships with a postgres URL. For convergence work the dev backend was switched to sqlite:
```
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 ./.venv/bin/alembic upgrade head
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Health check then returns `{"status":"ok","runtime":"server","database_backend":"sqlite"}`. `pmt_core` returns mock data so sqlite vs postgres only affects the user/items tables, not dashboard data. Test creds are at `~/.pmt-test-account` (gitignored at home).

---

## Previous Status (2026-04-20)

### Tauri dev watcher verification
- Reviewed the `readdirp is not a function` diagnosis and confirmed the root cause was pnpm virtual-store corruption caused by an accidental npm-style install path. The repaired tree is healthy again:
  - `nextjs-frontend/node_modules` is back to `706M`
  - embedded transitive `chokidar` entries under `.pnpm/*/node_modules/chokidar` are symlinks again instead of copied directories
- Re-ran `Module._resolveFilename` instrumentation against `pnpm exec next dev --webpack` and confirmed:
  - parent: `.../.pnpm/chokidar@3.6.0/node_modules/chokidar/index.js`
  - resolved `readdirp`: `.../.pnpm/readdirp@3.6.0/node_modules/readdirp/index.js`
  - loaded export: `typeof function`
- That means the current runtime no longer falls through to the hoisted `.pnpm/node_modules/readdirp@4.x` path.

### Verification rerun results
- `pnpm --dir nextjs-frontend build`: PASS
- `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm --dir nextjs-frontend build`: PASS
- `pnpm --dir nextjs-frontend tauri dev`: PASS
  - no `readdirp` matches in the full log
  - `curl http://127.0.0.1:18475/api/health` returned `{"status":"ok","runtime":"desktop","database_backend":"sqlite"}`
- `pnpm --dir nextjs-frontend tauri build --debug`: PASS
  - completed static export, Rust compile, `.app` bundling, and DMG packaging
  - produced both:
    - `nextjs-frontend/src-tauri/target/debug/bundle/macos/Portfolio Management Tool.app`
    - `nextjs-frontend/src-tauri/target/debug/bundle/dmg/Portfolio Management Tool_0.0.8_aarch64.dmg`
- `pnpm --dir nextjs-frontend install --frozen-lockfile`: PASS, reported `Already up to date`
- Additional adjacency checks:
  - `pnpm --dir nextjs-frontend test`: PASS, `9/9` suites and `32/32` tests
  - `pnpm --dir nextjs-frontend lint`: FAIL, but unrelated to `readdirp`

### Important findings from this pass
- `nextjs-frontend/watcher.js` is not dead code.
  - `nextjs-frontend/start.sh` runs `node watcher.js`
  - `nextjs-frontend/Dockerfile` uses `start.sh`
  - a smoke test with `OPENAPI_OUTPUT_FILE` set confirmed the watcher fires on file change and invokes `pnpm run generate-client`
- No `preinstall` hard-block for npm was added in this pass.
  - Reason: the actual fix was already in place by removing `nextjs-frontend/package-lock.json` and restoring the pnpm virtual store with `pnpm install --frozen-lockfile`
  - Keep `pnpm-lock.yaml` as the only frontend lockfile
- Deleted the temporary investigation artifacts from `/tmp`:
  - `/tmp/trace-readdirp.mjs`
  - `/tmp/trace-readdirp2.cjs`
  - `/tmp/patch-readdirp.cjs`
  - `/tmp/unpatch-readdirp.cjs`
  - `/tmp/tauri-dev.log`

### Repo/doc changes made during this verification pass
- Updated `docs/plans/tauri-implementation-plan.md` to reflect the newly observed behavior:
  - `pnpm --dir nextjs-frontend tauri build --debug` now completes DMG packaging in this environment
  - the old note about stalling at `bundle_dmg.sh` is obsolete
- This continuation update is the only additional file edited in the repo during the save-log step.

### Residual issues to remember
- Frontend lint is currently red for reasons unrelated to the watcher fix:
  - unused `waitFor` import in `nextjs-frontend/__tests__/loginPage.test.tsx`
  - `no-undef` for Node globals in `nextjs-frontend/next.config.mjs`
  - `no-undef` for Node globals in `nextjs-frontend/src-tauri/scripts/build-sidecar.mjs`
  - `no-undef` for Node globals in `nextjs-frontend/src-tauri/scripts/run-next-with-tauri-env.mjs`
  - linting of generated `nextjs-frontend/src-tauri/target/**` artifacts after Tauri build
- Do not restore `nextjs-frontend/package-lock.json` unless there is hard evidence the repo has intentionally reverted from pnpm. Current evidence still says it was a stale footgun.

## Current Status (2026-03-22)

### PMT backend
- FastAPI route/service mismatches are fixed for risk, events, orders, and performance.
- Logout contract is normalized to `200` JSON in `fastapi_backend/app/users.py`.
- OpenAPI schema now reflects the live backend and regenerates the frontend client from the running API.
- Latest verified backend matrix: `116/116` PASS.
- Verified route count: `49` authenticated `/api/*` PMT routes, or `51` total PMT surface when `/items/` routes are included.

### PMT frontend
- `pnpm tsc`, `pnpm lint`, `pnpm build`, and `pnpm exec jest --runInBand` are green.
- Full frontend Jest now passes: `8/8` suites PASS, `33/33` tests PASS.
- Generated client compatibility aliases were added in `nextjs-frontend/app/clientService.ts`.
- Auth/register/reset/add-item flows were updated to return `redirectTo` from server actions and navigate in the client pages.
- Auth page route modules were split into reusable page-view components, while route-level Jest coverage was restored for login redirect and reset-confirm missing-token behavior.
- The first live dashboard module migration is complete for `/dashboard/market-data/market-data`.
- Market data now loads through the generated client with the auth cookie:
  - missing `accessToken` redirects to `/login`
  - `401/403` API failures redirect to `/login`
  - other client/backend failures throw instead of degrading to `[]`
- Browser-visible polish fixes were added:
  - favicon metadata and asset in `nextjs-frontend/app/layout.tsx` and `nextjs-frontend/public/favicon.svg`
  - auth form `autocomplete` hints on login/register/password-recovery/reset-confirm pages
- Latest pushed commit: `374a7a5` (`Fix auth page tests and market data failures`).

### PMT browser verification
- Latest Playwright browser rerun is green.
- Latest focused smoke rerun: `4/4` PASS.
- Auth pages verified: `/`, `/login`, `/register`, `/password-recovery`, `/password-recovery/confirm?token=testtoken`
- Invalid login shows `LOGIN_BAD_CREDENTIALS`.
- Weak registration shows password validation errors.
- Fresh register -> login -> dashboard redirect works.
- First live market-data page load works after login.
- Dashboard route matrix: `43/43` PASS.
- Deep link `/dashboard/risk/risk-measures`: PASS.
- Back/forward on Positions -> Trade Summary: PASS.
- Browser console/page errors for the app were cleared after favicon + autocomplete fixes.

### PMT Jest status
- Reviewed auth-action Jest regressions remain fixed.
- Auth page suites are green again and the route-level behaviors are covered:
  - login page redirect path
  - password-reset-confirm missing-token `notFound()` path
- Latest full frontend Jest run:
  - `pnpm exec jest --runInBand`
  - result: `8/8` suites PASS, `33/33` tests PASS
- Residual non-blocking test noise:
  - React 19 `act(...)` warnings still appear across the auth page suites
  - warnings are noisy but non-failing in the current setup

### AG Grid demo app
- AG Grid demo app work is complete enough for continuation purposes.
- Last recorded status:
  - `26/26` demo pages rendered
  - `next build` and `tsc` passed
  - backend/frontend demo app are not the current blocker

## Remaining Work

### High priority
1. Continue replacing PMT dashboard local mock data with live FastAPI calls through the generated client, preserving the current UI structure.
2. Keep `pnpm exec jest --runInBand`, `pnpm tsc`, `pnpm lint`, `pnpm build`, and focused browser smoke green as each dashboard module is migrated.

### Medium priority
1. Reduce or eliminate the remaining React 19 `act(...)` warning noise in the auth page Jest suites.
2. Add clearer loading and error states to PMT dashboard pages as more modules move off mocks.

## Environment Notes
- Repo root: `/Users/orbot/Developer/work/Portfolio-Management-Tool`
- Backend dev URL: `http://127.0.0.1:8000`
- Frontend dev URL: `http://127.0.0.1:3000`
- PostgreSQL is required for the backend.
- Local PostgreSQL on `localhost:5432` worked in recent runs even when Docker was unavailable.
- Backend virtualenv may need recreation with `uv` if broken.
- Frontend schema/client generation now depends on the live backend being up.

## Useful Commands

### Backend
```bash
cd fastapi_backend
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
find app -name '*.py' -print0 | xargs -0 ./.venv/bin/python -m py_compile
./.venv/bin/python -c "from app.main import app; print('OK')"
```

### Frontend
```bash
cd nextjs-frontend
pnpm dev
pnpm tsc
pnpm lint
pnpm build
pnpm generate-client
pnpm exec jest --runInBand
```

### Browser E2E
```bash
playwright-cli open http://127.0.0.1:3000/login
```

## Continuation Prompt: PMT Dashboard API Wiring

Use this in the next conversation if you want another coder to continue from the current state:

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool.

Current state:
- Backend matrix is green: 116/116 PASS.
- Frontend build checks are green: pnpm tsc, pnpm lint, pnpm build.
- Full frontend Jest is green: 8/8 suites PASS, 33/33 tests PASS.
- Generated OpenAPI client is synced to the live backend schema.
- Browser smoke is green for:
  - /login invalid credentials
  - /register weak password
  - register -> login -> dashboard redirect
  - /dashboard/risk/risk-measures deep link
- Earlier dashboard route matrix is green: 43/43 PASS.
- The first live dashboard migration is complete for /dashboard/market-data/market-data using the generated client.
- Market-data auth/load handling is now correct:
  - missing token redirects to /login
  - 401/403 redirects to /login
  - other client/backend failures throw
- Latest pushed commit is 374a7a5 ("Fix auth page tests and market data failures").

Your tasks:
1. Migrate the next PMT dashboard module from local mock data to live API calls through the generated client without changing the current UI structure.
2. Re-run pnpm exec jest --runInBand and report exact final counts after each meaningful migration step.
3. Re-run pnpm tsc, pnpm lint, pnpm build, and a focused browser smoke test to ensure no regression.
4. If time allows, reduce the remaining React 19 act(...) warning noise in the auth page Jest suites.

Constraints:
- Do not break the already-green backend matrix, browser auth flow, dashboard route matrix, or full frontend Jest pass.
- Keep the generated OpenAPI client sourced from the live backend.
- Report exact PASS/FAIL counts, not summaries without numbers.
```
