# Portfolio Management Tool - Continuation Log

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
