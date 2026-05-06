# Portfolio Management Tool — Continuation Prompt (2026-05-06)

This document supplements `docs/plans/handoff-prompt-2026-05-05.md`. **Read that brief first** — its convergence loop (§5), per-page acceptance gate (§5.3), verification matrix (§12), and exit criteria (§11) all still apply unchanged. This file lists only what is still open and how the next team of agents should close it.

---

## 1. Mission

Drive `feat/nextjs-fastapi-rebuild` to **§11 exit criteria, all green**. The Reflex reference at `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex` (port 3001) remains the spec. The Next.js + FastAPI app at port 3000 must visually + functionally match it for every page in §6. Do not stop until every box is ticked and `continuations.md` records the final state.

---

## 2. Verified state (2026-05-06)

| Check | Result |
|---|---|
| Branch | `feat/nextjs-fastapi-rebuild`, fully pushed to origin (`c16c29e`) |
| Working tree | clean |
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | **11 suites / 35 tests passed** |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` (web) | PASS — 52 dashboard routes prerender as `○ Static` |
| `TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build` | PASS |
| Backend pytest (sqlite override) | **33 passed in 0.45s** |
| `grep -rE 'const mockData…' nextjs-frontend/app/dashboard \| wc -l` | 0 |
| Live `curl :…/api/positions/` (no flag, no token) | 401 Unauthorized |
| Live `curl :…/api/positions/` (`PMT_AUTH_DISABLED=true`, no token) | 200 + JSON list |

**70 commits landed.** Sections A–D plus auth-bypass are done. The only open exit criterion is §11 #12 (parity screenshots) plus a handful of page-level deltas listed below.

---

## 3. Hard rules (delta vs. the 05-05 brief)

All rules from §13 of the 2026-05-05 brief still hold. Two additions:

1. **Auth-bypass flags are dev-only.** `PMT_AUTH_DISABLED=true` (backend) and `NEXT_PUBLIC_AUTH_DISABLED=1` (frontend) let you run the parity loop in incognito with no login. Default OFF. Never enable in production. Auth code (login, register, password recovery, JWT, fastapi-users) stays in place when the flag is off.
2. **Single-point-of-change for auth changes.** The bypass is wired only at `current_active_user` (backend) and `<DashboardAuthGate>` + `getAuthToken()` + `TopNavigation` (frontend). Do not edit the 50 dashboard pages or the 13 backend route files for auth concerns.

---

## 4. Outstanding tracks

Resolve in order. Each track lands its own commits; do not bundle.

### Track 1 — `compliance/beneficial-ownership` field-shape mismatch

**Symptom.** The Reflex grid (`Portfolio-Management-Tool-reflex/app/components/compliance/beneficial_ownership_ag_grid.py`) expects `nosh_reported / nosh_bbg / nosh_proforma / stock_shares / warrant_shares / bond_shares / total_shares`. The FastAPI handler at `fastapi_backend/app/routes/compliance.py::get_beneficial_ownership` currently returns the shared restricted-list / undertakings shape, so the corresponding columns render empty in the Next.js grid.

**Action.**
1. Confirm the canonical shape by reading `Portfolio-Management-Tool-reflex/app/state/compliance_state.py` (or wherever the reflex side fans data into the grid) and `pmt_core_pkg/pmt_core/repositories/compliance/`.
2. Update `pmt_core` to emit the expected fields. The contract belongs in `pmt_core` — do not paper over with route-level translation.
3. Re-run backend pytest. If a fixture relies on the old shape, fix it.
4. Run §5 convergence on `dashboard/compliance/beneficial-ownership/page.tsx`. Adjust column defs to match the Reflex grid header set.
5. Commit: `feat(compliance): emit canonical beneficial-ownership fields from pmt_core`.

### Track 2 — 6 missing-endpoint placeholders → live grids

These routes currently render Construction-icon placeholders. For each, ship one backend commit then one frontend commit (12 total).

| Page | Endpoint to add | pmt_core repository | Reflex grid component |
|---|---|---|---|
| `compliance/monthly-exercise-limit` | `GET /api/compliance/monthly-exercise-limit` | `pmt_core.repositories.compliance` | `compliance/monthly_exercise_limit_ag_grid.py` |
| `portfolio-tools/deal-indication` | `GET /api/portfolio-tools/deal-indication` | `pmt_core.repositories.portfolio_tools` | `portfolio_tools/deal_indication_ag_grid.py` |
| `portfolio-tools/po-settlement` | `GET /api/portfolio-tools/po-settlement` | `pmt_core.repositories.portfolio_tools` | `portfolio_tools/po_settlement_ag_grid.py` |
| `portfolio-tools/short-ecl` | `GET /api/portfolio-tools/short-ecl` | `pmt_core.repositories.portfolio_tools` | `portfolio_tools/short_ecl_ag_grid.py` |
| `instruments/instrument-data` | `GET /api/instruments/instrument-data` | `pmt_core.repositories.instruments` | `instruments/instrument_data_ag_grid.py` |
| `instruments/instrument-term` | `GET /api/instruments/instrument-term` | `pmt_core.repositories.instruments` | `instruments/instrument_term_ag_grid.py` |

**Procedure per page.**
1. Verify the `pmt_core` repository has the data fetcher (the Reflex side already calls these — `grep -r "<thing>" Portfolio-Management-Tool-reflex/pmt_core_pkg/`).
2. Add the route function in `fastapi_backend/app/routes/<module>.py` modeled on the existing `get_*` handlers; wire `Depends(current_active_user)`.
3. Add an endpoint test in `fastapi_backend/tests/routes/test_<module>.py` (200 path + unauthorized-401 path with flag off).
4. Bring the backend up (with the sqlite override and either flag value) and run `pnpm --dir nextjs-frontend generate-client` to refresh `app/openapi-client/sdk.gen.ts`.
5. Replace the Construction placeholder at `dashboard/<module>/<page>/page.tsx` with the §7 reference pattern (DataGrid + columns from `components/grid/columns.ts`, mirroring the Reflex AG Grid component's header set + formatters).
6. Run §5.3 convergence loop against `:3001/pmt/<route>` and `:3000/dashboard/<route>`.
7. Run §12 verification matrix; commit when green:
   - `feat(<module>): add /<endpoint> route + pytest coverage`
   - `feat(<module>): migrate <page> to AG Grid + live API`
8. Push every 3–5 commits.

### Track 3 — Pricer · Warrant / Pricer · Bond (form ports)

`risk/pricer-warrant` and `risk/pricer-bond` are scaffolded as Construction placeholders. The Reflex equivalents (`Portfolio-Management-Tool-reflex/app/components/risk/pricer_warrant_view.py`, `pricer_bond_view.py`) ship a 21-field Terms / Simulations / Outputs / chart layout. **This is a form port, not a DataGrid migration** — the §7 reference pattern does not apply.

**Likely blocker.** `pmt_core.repositories.risk` may not yet expose a pricer entrypoint. Verify with:
```bash
grep -rn "pricer" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/pmt_core_pkg
```

If a pricer service exists in pmt_core, port it through FastAPI (`POST /api/risk/pricer/warrant` taking the 21 inputs, returning the simulation outputs + chart series). If pmt_core stubs the calculation, scope to a structurally aligned form with disabled submit and a TODO note.

**⚠ Surface to the user before doing the calculation port.** Estimate >2 hours of UI work per page; confirm scope (full calculator vs. structural skeleton) before writing code. Present the trade-off as one paragraph and wait for an answer.

### Track 4 — §11 exit criterion #12: parity screenshots

The only purely-orchestration item.

**Three-terminal setup.**
```bash
# Terminal A — backend (auth bypass + sqlite)
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal B — Next.js (auth bypass)
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev    # → :3000

# Terminal C — Reflex reference
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                        # → :3001/pmt/
```

Health-check each before screenshotting (`curl :8000/api/health`, `curl -I :3000`, `curl -I :3001/pmt/`).

**Capture.** Use the `playwright-cli` skill. For each of the 11 modules (market-data, positions, pnl, risk, recon, compliance, portfolio-tools, instruments, events, operations, orders), pick the canonical landing page (the first subtab in `lib/constants.ts`) and capture both sides:

```
docs/parity-screenshots/<module>/<page>-reflex.png
docs/parity-screenshots/<module>/<page>-nextjs.png
```

22 PNGs total. Match viewport size on both sides (Reflex defaults; mirror in playwright).

**Document expected deltas in `docs/parity-screenshots/README.md`.** Pages that won't match unless Tracks 2/3 shipped first:
- `risk/pricer-warrant`, `risk/pricer-bond` (forms, not grids)
- `compliance/monthly-exercise-limit`
- `portfolio-tools/{deal-indication, po-settlement, short-ecl}`
- `instruments/{instrument-data, instrument-term}`

Reviewers should know which deltas are intentional.

**Commit.** `docs(parity): capture side-by-side screenshots for 11 modules` — one commit for the README + 22 PNGs.

### Track 5 — Final exit gate

After Tracks 1–4 land:

1. Run §12 verification matrix end-to-end. Cite exact numbers (`X/X tests`, `N passed in T s`). Never just say "all green".
2. Walk §11 #1–#13. Tick each. Anything red goes back into the convergence loop.
3. Append a 2026-05-XX entry to `continuations.md` with the final commit count and the exit-criteria checklist.
4. Push.

---

## 5. Open questions to surface to the user

1. **Backend pytest coverage** (§17.1 of the 05-05 brief). Was 116 in 2026-03-22, is 33 today. Route-level tests pruned during the Tauri refactor were not restored beyond `test_notifications.py`, `test_performance.py`, and `test_auth_bypass.py`. **Ask before adding/removing route tests beyond what Track 2 explicitly requires.** The user may want the old coverage restored, or may want to leave it lean now that the routes are exercised end-to-end via parity screenshots.
2. **Pricer scope** (Track 3). Confirm full calculator vs. structural skeleton before committing >2 hours.
3. **Mobile target.** The `Recommendation for Extending to Web, Desktop, and Mobile with Tauri.md` plan covers iOS/Android, but no mobile scaffold exists. Out of scope unless reprioritised.

---

## 6. Recovery from interruption

Standard contract from §14 of the 05-05 brief. After a crash:

1. `git status` is the truth. Anything uncommitted is either a half-done page (finish or stash) or stale debris (clean).
2. `git log --oneline -50` shows what landed. Cross-reference against §6 of the 05-05 brief and the table in Track 2 above.
3. Resume from the first unchecked item.
4. Run §12 verification matrix. If anything is red, fix before adding new work.

---

## 7. Resume prompt (paste into a fresh session)

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read these in order before doing anything:
1. docs/plans/handoff-prompt-2026-05-05.md — source of truth (convergence loop §5, per-page gate §5.3, exit criteria §11, verification matrix §12)
2. docs/plans/handoff-prompt-2026-05-06.md — the 5 outstanding tracks and the auth-bypass workflow
3. continuations.md — most recent entries first

Current state (2026-05-06): 70 commits landed; jest 11/35; pytest 33/33; lint 0/0; tsc clean; web + Tauri build PASS; tree clean; fully pushed. Auth-bypass flags PMT_AUTH_DISABLED + NEXT_PUBLIC_AUTH_DISABLED are wired so :3000 and :3001 can be compared without logging in.

Outstanding work, in order, commit per item:

1. Track 1 — fix compliance/beneficial-ownership field shape in pmt_core.repositories.compliance, then converge the page.
2. Track 2 — wire 6 missing FastAPI endpoints (compliance/monthly-exercise-limit, portfolio-tools/{deal-indication, po-settlement, short-ecl}, instruments/{instrument-data, instrument-term}); regenerate the OpenAPI client; replace the 6 Construction placeholders with §7-pattern grids. Pytest test per endpoint; convergence loop per page. 12 commits + tests.
3. Track 3 — risk/pricer-warrant + risk/pricer-bond. SURFACE TO USER FIRST: full 21-field calculator port vs. structural skeleton with disabled submit. Wait for an answer before committing >2 hours.
4. Track 4 — §11 #12 parity screenshots. Three-terminal setup with both bypass flags ON; playwright-cli for each of 11 modules; save under docs/parity-screenshots/<module>/<page>-{reflex,nextjs}.png; document expected deltas in docs/parity-screenshots/README.md.
5. Track 5 — run §12 verification matrix end-to-end (cite exact numbers); walk §11 #1-#13; append a 2026-05-XX continuations.md entry; push.

Hard rules (do not violate):
- Do not stop until §11 is met. Loop pages until done.
- Commit per page; push every 3–5 commits. Never accumulate >1 page in the working tree.
- The Reflex app at :3001 is the spec — read it, run it, screenshot it. Do not invent UX.
- Do not hand-edit nextjs-frontend/app/openapi-client/. Regenerate via pnpm generate-client against a running backend.
- Do not regenerate package-lock.json. Pnpm-only.
- No 'use server' on auth pages. No server-side cookies() calls.
- Auth-bypass flags must default OFF in any committed env example.
- Cite exact numbers (X passed, T seconds). Never just "all green".

Ask before:
- Adding/removing route tests beyond what each track requires (§5 — backend pytest 116-vs-33 question).
- Spending >2 hours on the pricer ports.

Run §12 verification between commits and report exact PASS/FAIL counts.
```

---

End of 2026-05-06 supplement.
