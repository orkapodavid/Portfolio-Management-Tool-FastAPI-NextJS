# Portfolio Management Tool - Continuation Log

## Current Status (2026-03-22)

### PMT backend
- FastAPI route/service mismatches are fixed for risk, events, orders, and performance.
- Logout contract is normalized to `200` JSON in `fastapi_backend/app/users.py`.
- OpenAPI schema now reflects the live backend and regenerates the frontend client from the running API.
- Latest verified backend matrix: `116/116` PASS.
- Verified route count: `49` authenticated `/api/*` PMT routes, or `51` total PMT surface when `/items/` routes are included.

### PMT frontend
- `pnpm tsc`, `pnpm lint`, and `pnpm build` were fixed and are green.
- Generated client compatibility aliases were added in `nextjs-frontend/app/clientService.ts`.
- Auth/register/reset/add-item flows were updated to return `redirectTo` from server actions and navigate in the client pages.
- Browser-visible polish fixes were added:
  - favicon metadata and asset in `nextjs-frontend/app/layout.tsx` and `nextjs-frontend/public/favicon.svg`
  - auth form `autocomplete` hints on login/register/password-recovery/reset-confirm pages

### PMT browser verification
- Latest Playwright browser rerun is green.
- Auth pages verified: `/`, `/login`, `/register`, `/password-recovery`, `/password-recovery/confirm?token=testtoken`
- Invalid login shows `LOGIN_BAD_CREDENTIALS`.
- Weak registration shows password validation errors.
- Fresh register -> login -> dashboard redirect works.
- Dashboard route matrix: `43/43` PASS.
- Deep link `/dashboard/risk/risk-measures`: PASS.
- Back/forward on Positions -> Trade Summary: PASS.
- Browser console/page errors for the app were cleared after favicon + autocomplete fixes.

### PMT Jest status
- Reviewed auth-action Jest regressions were fixed.
- Targeted passing slice:
  - `pnpm test -- --runInBand __tests__/register.test.ts __tests__/passwordReset.test.tsx __tests__/passwordResetConfirm.test.tsx`
  - result: `3/3` suites PASS, `11/11` tests PASS
- Latest known full frontend Jest status is still red:
  - `pnpm exec jest --runInBand`
  - failing suites: `4/8`
  - failing page suites:
    - `__tests__/loginPage.test.tsx`
    - `__tests__/registerPage.test.tsx`
    - `__tests__/passwordResetPage.test.tsx`
    - `__tests__/passwordResetConfirmPage.test.tsx`
  - failing tests: `16/31`
  - failure mode: page-component Jest mounts around `useActionState` / Next client-hook rendering

### AG Grid demo app
- AG Grid demo app work is complete enough for continuation purposes.
- Last recorded status:
  - `26/26` demo pages rendered
  - `next build` and `tsc` passed
  - backend/frontend demo app are not the current blocker

## Remaining Work

### High priority
1. Fix the 4 failing PMT page-level Jest suites.
2. Re-run the full frontend Jest suite and record exact counts after fixes.
3. Keep browser/build verification green after those Jest fixes.

### Medium priority
1. Wire PMT dashboard pages from local mock data to the live FastAPI endpoints through the generated client.
2. Add loading and error states to PMT dashboard pages.

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

## Continuation Prompt: PMT Frontend Jest + API Wiring

Use this in the next conversation if you want another coder to continue from the current state:

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool.

Current state:
- Backend matrix is green: 116/116 PASS.
- Frontend build/browser checks are green.
- Generated OpenAPI client is synced to the live backend schema.
- Browser E2E is green for auth + all 43 dashboard routes.
- Remaining blocker is the full frontend Jest suite:
  - pnpm exec jest --runInBand
  - failing suites: 4/8
  - failing page suites:
    - __tests__/loginPage.test.tsx
    - __tests__/registerPage.test.tsx
    - __tests__/passwordResetPage.test.tsx
    - __tests__/passwordResetConfirmPage.test.tsx
  - latest known failing tests: 16/31
  - likely cause: page-level test setup around useActionState / Next client hooks

Your tasks:
1. Fix the 4 failing page-level Jest suites.
2. Re-run pnpm exec jest --runInBand and report exact final counts.
3. Re-run pnpm tsc, pnpm lint, and a browser smoke test for login + dashboard navigation to ensure no regression.
4. If Jest is green, start replacing local PMT page mock data with real API calls through the generated client, beginning with one module and preserving the existing UI.

Constraints:
- Do not break the already-green backend matrix, browser auth flow, or dashboard route matrix.
- Keep the generated OpenAPI client sourced from the live backend.
- Report exact PASS/FAIL counts, not summaries without numbers.
```
