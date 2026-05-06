# Portfolio Management Tool — Feature-Parity Audit Handoff (2026-05-09)

This brief is a **read-only audit** that follows the chain of
2026-05-05 → 05-06 → 05-07 → 05-08 handoffs. The 2026-05-08 session
closed the live-flash + cross-page notification jump gaps and
declared parity reached on the 22 canonical screenshot pages. This
audit re-walked the **49 routes** in `nextjs-frontend/lib/constants.ts`
plus the shared grid + chrome layer at code level (and a five-page
browser spot-check) to answer the question: *where does Reflex
still do something Next.js does not?*

**Headline:** parity is **not** reached. 22 actionable findings
remain (F-1 .. F-29 in [`findings.md`](../parity-audit/2026-05-09/findings.md)),
1 of which is a backend Blocker (operations Rerun/Kill), 1 is a
shared-template Blocker (PnL filter bars), and 7 more are High.

The audit produced **no code changes**. All artifacts live under
`docs/parity-audit/2026-05-09/`. Verification snapshot at audit
close is identical to HEAD `5f1c7b9`:

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | **13 suites / 69 tests** in 1.019 s |
| `pnpm lint` | 0 / 0 |
| `pnpm build` (web) | PASS — exit 0 |
| Backend pytest (sqlite override) | **175 passed, 2 skipped in 7.83 s** |
| `git status` | clean, fully pushed |

---

## 1. Mission for the next session

Close as much of [`findings.md`](../parity-audit/2026-05-09/findings.md)
as the user authorises, in the order recommended at the bottom of
that file. The §"Recommended next implementation order" splits
naturally into three milestones:

- **Milestone A — backend + filter bars (F-1, F-3, F-4, F-8, F-15, F-16, F-29).**
  Adds two POST routes, three GET query params, three slug aliases,
  and ~7 page-level filterBar wirings. Roughly one half-day of
  engineering. Closes 4 Blockers + 4 High issues at once.

- **Milestone B — live-data feel rollout (F-2, F-22).** Make
  `simulateUpdate` implicitly drive `autoRefreshIntervalMs`, then
  port simulators to the 26 non-simulated pages. Roughly a full day,
  bulk of the work in `lib/grid-simulators.ts` + per-page wiring.

- **Milestone C — polish (F-7, F-6, F-11, F-12, F-17, F-18, plus the
  visual / a11y items).** Half-day; many small commits.

After Milestone A, the audit's "Top 10" is half closed. After B, the
last visible difference at idle on `:3000` vs `:3001` is the pricer
3-D chart (F-9, intentional delta) and the mobile nav (F-27,
deprioritised target).

---

## 2. Reading order for the takeover agent

Before writing any code:

1. `docs/plans/handoff-prompt-2026-05-05.md` — convergence loop,
   per-page acceptance gate, hard rules.
2. `docs/plans/handoff-prompt-2026-05-06.md` — auth-bypass workflow,
   OpenAPI baseURL bootstrap.
3. `docs/plans/handoff-prompt-2026-05-07-feature-parity.md` — toolbar
   / status-bar / grid-runtime feature pass (closed).
4. `docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md` —
   live-flash + cross-page jump (closed).
5. **This file**.
6. `docs/parity-audit/2026-05-09/findings.md` — the 22 numbered
   findings.
7. `docs/parity-audit/2026-05-09/route-matrix.md` — 50-row matrix
   keyed on the findings IDs.
8. `continuations.md` — most recent entry first.

---

## 3. Hard rules (carry over)

All rules from §13 of the 2026-05-05 brief still hold. Plus:

1. **Reflex is the spec.** Every behaviour question gets answered by
   reading `Portfolio-Management-Tool-reflex/`. Do not guess.
2. **Verify before you fix.** Several findings in this audit revised
   prior-brief claims (e.g. agent 4 initially flagged 4 recon pages
   as "missing date filter" but a code-level grep showed all five are
   wired). Trust nothing; grep.
3. **Surface scope decisions before committing >2 hours.** The pricer
   3-D chart (F-9) and the mobile nav (F-27) are documented as known
   deltas; do not silently expand scope to them.
4. **Cite exact numbers between commits.** Never just "all green".
5. **Don't touch already-converged pages.** The 22 canonical
   screenshots in `docs/parity-screenshots/` are the regression
   baseline. Re-shoot them after each milestone.
6. **One commit per defect.** F-1 (backend) and F-8 (frontend) are
   two commits, not one.

---

## 4. Auth-bypass parity loop (unchanged from 2026-05-08)

```bash
# Terminal A — backend
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal B — Next.js
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev    # → :3000

# Terminal C — Reflex
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run                        # → :3001/pmt/
```

Health-check `/api/health`, `:3000/dashboard/*`, `:3001/pmt/*`
return 200 before working.

---

## 5. Verification matrix (run between commits)

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand
pnpm lint
pnpm build

cd ../fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

Expected steady state at audit close:
- TSC: clean
- Jest: ≥ 69 tests
- Lint: 0 / 0
- Web build: PASS, ~59 routes
- Backend pytest: 175 passed, 2 skipped

Each milestone should add tests:
- Milestone A: +2 backend tests (operations rerun/kill 200+401),
  +1 jest for slug aliases.
- Milestone B: +N jest tests (one per simulator function).
- Milestone C: +1 jest for search debounce, +1 for sticky-highlight
  retry timeout.

---

## 6. Exit criteria for "parity reached"

Do not declare parity until **every** below is true:

1. All Blockers in `findings.md` are closed.
2. All High items either fixed or surfaced to user as accepted
   deltas with a sentence in `docs/parity-screenshots/README.md`.
3. The 22 canonical screenshots re-captured and visually equivalent.
4. A second browser walk covers every route in `route-matrix.md`,
   not just the 5 spot-checked here. Each row's "Browser parity"
   column is **PASS** or has a written-up MISMATCH that the user has
   acknowledged.
5. Verification matrix all green with cited numbers.
6. `continuations.md` has a 2026-05-XX entry summarising the closed
   milestones.

---

## 7. Open questions to surface to the user before coding

1. **F-7 reset-dates extra `market_price` column.** Next.js page
   ships a `market_price` column that Reflex does not. Treat as a
   deliberate enhancement (keep) or an accident (remove)?
2. **F-22 simulator scope.** Reflex simulates 28 pages. Some (e.g.
   compliance) are already documented as static. Confirm the user
   wants the full 26-page port or a subset.
3. **F-9 + F-27** intentional deltas — confirm they remain out of
   scope for this round.
4. **F-21 sidebar default-open state.** Open by default to match
   Reflex's first-paint, or keep collapsed?
5. **F-23 notification infinite scroll.** Worth porting or wait
   until the notification dataset grows past ~50?

Ask via `AskUserQuestion`, then stash the answers in
`continuations.md`.

---

## 8. Resume prompt for a fresh agent

```text
Resume work in /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read in order:
1. docs/plans/handoff-prompt-2026-05-05.md (source of truth)
2. docs/plans/handoff-prompt-2026-05-06.md
3. docs/plans/handoff-prompt-2026-05-07-feature-parity.md
4. docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md
5. docs/plans/handoff-prompt-2026-05-09-feature-parity-audit.md (THIS BRIEF)
6. docs/parity-audit/2026-05-09/findings.md
7. docs/parity-audit/2026-05-09/route-matrix.md
8. continuations.md (newest first)

Audit baseline at HEAD 5f1c7b9: tsc clean, jest 13/69, lint 0/0, web build PASS, backend pytest 175 passed / 2 skipped.

Mission: close the 22 numbered findings F-1..F-29 in audit-recommended order.
- Milestone A: F-1, F-3, F-4, F-8, F-15, F-16, F-29 (4 Blockers + 4 High).
- Milestone B: F-2, F-22 (live-data feel; 26 pages).
- Milestone C: polish (F-6, F-7, F-10, F-11, F-12, F-17 .. F-26).

Hard rules:
- Reflex at :3001/pmt/ is the spec — read it before changing code.
- Don't break the 22 canonical screenshots.
- Cite exact numbers; never "all green".
- Commit per defect; push every 2-3 commits.
- AskUserQuestion before working on F-7's market_price ambiguity, F-22's simulator scope, and the documented deltas (F-9, F-27).

Three-terminal setup with bypass flags ON. playwright-cli with -s=reflex / -s=nextjs at 1440x900.

Run §5 verification matrix between commits. Walk every route in route-matrix.md as the second browser pass after Milestone A lands.

Exit criteria in §6 of this brief — every Blocker closed, route-matrix all PASS or accepted MISMATCH, verification matrix green.
```

---

## 9. Useful one-liners

```bash
# Re-shoot the 22 canonical parity screenshots after a milestone
ls docs/parity-screenshots/*/*.png | wc -l    # → 22 PNGs

# Confirm a Reflex mixin's refresh cadence
grep -n "asyncio.sleep" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/app/states/<module>/mixins/<page>_mixin.py

# Confirm a Reflex AG Grid column set
grep "header_name=\|field=" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/app/components/<module>/<page>_ag_grid.py

# Reflex notifications shape (12 items, has grid_id, row_id, module, subtab)
curl -s http://127.0.0.1:8000/api/notifications/ | python3 -m json.tool | head -16
```

---

End of 2026-05-09 audit handoff. Audit produced **no code
modifications**; worktree was clean at HEAD `5f1c7b9` at audit
close and remains so.
