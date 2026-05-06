# Portfolio Management Tool — Finish Milestone B + Run Milestone C (2026-05-11)

This brief follows the chain 2026-05-05 → 05-06 → 05-07 → 05-08 →
05-09 → 05-10. The 2026-05-10 walk-and-implement session closed
**Phase 1** (full per-route browser walk on 50 routes, +9 new findings
F-30..F-38) and **Milestone A** (backend + filter bars: F-29, F-15,
F-16, F-1, F-3 ×4, F-31 ×2, F-4 ×3, F-8). It then started **Milestone B**
(live-data feel) and dispatched 5 parallel sub-agents for the
26-page simulator port. The session ended with **3 of 5 simulator
agents committed**, **1 partially committed** (events code landed
inside another agent's commit), and **1 still in flight** (risk +
portfolio-tools + market-data-historical not yet staged). This brief
asks the next team to finish Milestone B and run Milestone C.

---

## 0. Verified state at session close

```bash
git log --oneline 5f1c7b9..HEAD
b6addcf feat(portfolio-tools): add client-side simulators for live cell flash      # B3
adacb44 feat(risk): add client-side simulators for live cell flash                 # B3
afdc661 feat(market-data): add historical-data simulator (5s cadence)              # B5
0b0702f feat(orders): add client-side simulators for live cell flash               # B5 (re-commit)
c85bbe1 feat(operations): add client-side simulators for live cell flash           # B5
bda06fa feat(instruments): add client-side simulators for live cell flash          # B4
b632e44 feat(pnl): add client-side simulators for live cell flash                  # B1
10f95e7 feat(positions): add client-side simulators for live cell flash            # B2
a5d5c26 feat(grid-simulators): port simulateFinancialTick + simulateNumericTick    # utilities
6bda228 feat(grid): when simulateUpdate is set, default autoRefreshIntervalMs to simulator cadence
d474493 docs(parity-screenshots): re-capture 22 canonical screenshots after Milestone A
f00b97d feat(operations): rerun + kill context menu                       # F-8
5078cc8 feat(portfolio-tools): add position-date filter bar on excess-amount    # F-4
e08d8b6 feat(portfolio-tools): add position-date filter bar on cb-installments  # F-4
b0fb512 feat(portfolio-tools): add position-date filter bar on pay-to-hold      # F-4
9990868 feat(risk): add position-date filter bar on risk-measures               # F-31
e0381a9 feat(risk): add position-date filter bar on delta-change                # F-31
f062735 feat(pnl): add position-date filter bar on pnl-full                     # F-3
d45c219 feat(pnl): add position-date filter bar on pnl-currency                 # F-3
e8ebff9 feat(pnl): add position-date filter bar on pnl-summary                  # F-3
e570b51 feat(pnl): add position-date filter bar on pnl-change                   # F-3
ab60294 feat(operations): expose rerun + kill POST routes                       # F-1
a38fde8 feat(instruments): accept pos_date on /special-terms                    # F-16
a92ecf3 feat(compliance): accept position_date on /undertakings                 # F-15
6766871 feat(notifications): alias slug overrides for special-term + daily-procedure-check  # F-29
22db9ce docs(parity-audit): full per-route browser walk on 50 routes            # Phase 1
```

26 commits landed since session start (HEAD `5f1c7b9` → `b6addcf`).
Branch is **8 commits ahead of origin** (need to push once Milestone B
finishes the events module + screenshot re-shoot).

History note (B5 reset): the orders agent's first attempt was
commit `4bf64fd` and accidentally bundled the events agent's files.
B5 ran `git reset --soft HEAD~1` + `git restore --staged` and
re-committed orders cleanly as `0b0702f`. Events files are now
**uncommitted** in the worktree — see §0.1 below. No history rewrite
beyond that single uncommitted commit.

### 0.1 Dirty tree at session close (Milestone B events leftover)

```
~ Modified: 3 files
   nextjs-frontend/app/dashboard/events/event-calendar/page.tsx
   nextjs-frontend/app/dashboard/events/event-stream/page.tsx
   nextjs-frontend/app/dashboard/events/reverse-inquiry/page.tsx
? Untracked: 4 files
   .claude/scheduled_tasks.lock                          # ignore — session-local
   docs/plans/handoff-prompt-2026-05-11-...md            # this brief; commit it with the events commit or separately
   nextjs-frontend/__tests__/eventsSimulators.test.ts
   nextjs-frontend/lib/grid-simulators/events.ts
```

These are the **B4 events** files left orphaned after B5's reset
of the bundled orders commit. They are correct as-written (per B4's
return note) — just need to be staged and committed.

### Verification snapshot at session close

The B3 portfolio-tools commit (`b6addcf`) reported jest 147 passing
+ tsc clean. B5's market-data-historical commit (`afdc661`) reported
jest 138 passing — different count because B5 ran before B3.

The committed-but-orphaned **events files** (§0.1) are NOT in any
commit yet, so the post-`b6addcf` jest count of 147 may include
events tests if Milestone B agents ran them while events.ts existed
in the worktree. Re-run yourself — actual numbers are what counts:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand 2>&1 | tail -5
pnpm lint
```

Cite the actual numbers you see.

### Known issue: orders/emsx-order page used to have an unused-import
warning before B5's reset. After B5 re-committed `0b0702f` with the
correct file content, this should be resolved — but verify by
inspecting `nextjs-frontend/app/dashboard/orders/emsx-order/page.tsx`
for `simulateUpdate={emsxOrderSimulator}` on the `<DataGrid>`. If
missing, that's still a fix-needed bug. tsc is the authority.

### Open scope decisions confirmed in this session
- **Phase 1 walk: full** — completed (50 routes; 16 PASS / 34 MISMATCH;
  9 new findings F-30..F-38 merged into `findings.md`).
- **F-22 simulator scope: full 26 pages** — confirmed; in flight as of
  this brief.
- **F-9 (Plotly 3-D) / F-27 (mobile nav) / F-28 (Reflex ticker-data)
  stay out of scope** — confirmed.
- **AG Grid Enterprise license: live with trial warnings** — confirmed.

### Open questions deferred to your session
1. **F-7 reset-dates `market_price` column** — Next.js ships an extra
   column Reflex doesn't. Keep (enhancement) or remove (parity)?
   AskUserQuestion before implementing C5 (the reset-dates filter
   bar) so the column trim doesn't get bundled in.
2. **F-21 sidebar default-open** — Reflex opens by default; Next.js
   stays collapsed. AskUserQuestion before C11.
3. **F-23 notification infinite scroll** — Worth porting now or wait
   until the dataset grows past ~50? AskUserQuestion before C12.
4. **F-7 + F-35 column-set drift** — broader product decision: should
   Next.js trim down to Reflex's narrower default visible set, or
   should Reflex's hide list be documented as out-of-date? Touches
   most pnl / risk / portfolio-tools / instruments / events / orders
   pages. AskUserQuestion before deciding the polish-track scope.
5. **Backend pytest target** — currently 186. After Milestone B the
   simulator commits add jest tests but no new pytest cases.
   Confirm 186 is the new floor and surface if you want more route
   tests added.

---

## 1. Mission

Two phases:

### Phase A — Finish Milestone B (live-data feel rollout)
Close the 3 missing per-module simulator commits, fix the
`emsxOrderSimulator` unused-import bug, push, re-run the verification
matrix, and re-shoot the 22 canonical screenshots. ~3 commits.

### Phase B — Milestone C (polish)
Close the 13 numbered Milestone-C sub-tracks (F-17 search debounce,
F-18 sticky-highlight retry, F-12 row-group panel, F-6 stock-screener
filter bar, F-7 reset-dates filter bar, F-11+F-32+F-10+F-33 pricer
notes/results table, F-30 calm-page auto-refresh hide, F-19/F-20/F-24/F-26
small visuals, F-34 compliance/beneficial-ownership single-date swap),
following the order in the audit's "Recommended next implementation
order" plus the four AskUserQuestion gates above. ~12-18 commits.

Skip F-9, F-27, F-28 per user.

---

## 2. Reading order

Before touching anything:

1. `docs/plans/handoff-prompt-2026-05-05.md` — convergence loop, per-page acceptance gate, hard rules.
2. `docs/plans/handoff-prompt-2026-05-06.md` — auth-bypass workflow.
3. `docs/plans/handoff-prompt-2026-05-07-feature-parity.md` — toolbar / status-bar / grid-runtime feature pass (closed).
4. `docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md` — live-flash + cross-page jump (closed).
5. `docs/plans/handoff-prompt-2026-05-09-feature-parity-audit.md` — audit handoff.
6. `docs/plans/handoff-prompt-2026-05-10-walk-and-implement.md` — walk + Milestone A handoff.
7. **This file** (2026-05-11).
8. `docs/parity-audit/2026-05-09/findings.md` — F-1..F-38 findings (post-walk merge).
9. `docs/parity-audit/2026-05-09/route-matrix.md` — 50/50 PASS or MISMATCH.
10. `docs/parity-screenshots/README.md` — known intentional deltas.
11. `continuations.md` — newest first.

Then `git log --oneline -25` to see exactly what landed in 2026-05-10.

---

## 3. Hard rules (carry over)

All rules from §13 of the 2026-05-05 brief still hold. Plus:

1. **Reflex at `:3001/pmt/` is the spec.** Read the Reflex source for
   any behaviour question.
2. **One commit per defect.** Don't bundle.
3. **Push every 2-3 commits.**
4. **Cite exact numbers.** Never "all green".
5. **Don't break the 22 canonical screenshots.** Re-shoot after each
   milestone closes; visually diff against the committed PNGs.
6. **AskUserQuestion before** F-7 / F-21 / F-23 / F-35 / pytest target
   choices (see §0 deferred questions).
7. **No new dependencies** without surfacing.
8. **Don't touch `nextjs-frontend/app/openapi-client/`** by hand;
   regenerate via `pnpm generate-client` against a running backend.
9. **Trial-license AG Grid Enterprise warnings are acceptable** — user
   reconfirmed 2026-05-10.
10. **Storage keys stay under `pmt:next:`**; new namespace decisions
    must follow that convention.

---

## 4. Three-terminal setup (unchanged)

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

Health-check (`curl :8000/api/health`, `curl -I :3000`,
`curl -I :3001/pmt/`) before any compare. If they're already running
from a prior session, leave them.

---

## 5. Phase A — Finish Milestone B

### 5.1 Pre-flight (1 minute)

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool
git status
git log --oneline 5f1c7b9..HEAD | head -25
```

Confirm:
- Branch ahead of origin by 8 commits (or rebase if origin moved).
- 3 modified events pages + 4 untracked (events.ts + eventsSimulators.test.ts + this brief + scheduled_tasks.lock).

If the dirty files match §0.1, proceed. If they look different,
do a quick `git diff` to understand what actually landed and adjust.

### 5.2 Commit 1 — Events simulators (B4 leftover)

The B4 events files were orphaned by B5's history reset (see §0).
Stage and commit just those files:

```bash
git add nextjs-frontend/lib/grid-simulators/events.ts \
        nextjs-frontend/__tests__/eventsSimulators.test.ts \
        nextjs-frontend/app/dashboard/events/event-calendar/page.tsx \
        nextjs-frontend/app/dashboard/events/event-stream/page.tsx \
        nextjs-frontend/app/dashboard/events/reverse-inquiry/page.tsx

# Verify before commit
pnpm --dir nextjs-frontend exec tsc --noEmit
pnpm --dir nextjs-frontend exec jest --runInBand __tests__/eventsSimulators.test.ts

git commit -m 'feat(events): add client-side simulators for live cell flash'
```

### 5.3 Verify orders page (sanity check after B5's reset)

Open `nextjs-frontend/app/dashboard/orders/emsx-order/page.tsx` and
confirm the `<DataGrid>` block has `simulateUpdate={emsxOrderSimulator}`.
If missing, add it and commit `fix(orders): wire emsxOrderSimulator
into emsx-order DataGrid`. tsc would already be flagging this if so —
trust tsc.

### 5.4 Commit the handoff brief itself

```bash
git add docs/plans/handoff-prompt-2026-05-11-finish-milestone-b-and-c.md
git commit -m 'docs(plans): handoff brief for finishing Milestone B and running Milestone C'
```

### 5.5 Push

```bash
git push origin feat/nextjs-fastapi-rebuild
```

If push is rejected (origin moved):
```bash
git pull --rebase origin feat/nextjs-fastapi-rebuild
git push origin feat/nextjs-fastapi-rebuild
```

### 5.6 Verification matrix (cite exact numbers)

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

Expected after Milestone B (post §5.2 events commit):
- TSC: clean
- Jest: ≥ 26 suites / ≥ 150 tests
- Lint: 0 / 0
- Web build: PASS, ~59 routes
- Backend pytest: 186 / 2 skipped (no backend changes in B)

If any of these is red, fix before moving on.

### 5.7 Push

```bash
git push origin feat/nextjs-fastapi-rebuild
```

### 5.8 Re-shoot the 22 canonical screenshots (Milestone B exit gate — optional but recommended)

Use the recipe from `docs/parity-screenshots/README.md` and the
last successful run in commit `d474493`. The 11 modules' first
subtab × {reflex, nextjs} = 22 PNGs. Auth-bypass flags ON.

```bash
playwright-cli -s=reflex-B open --browser=chrome
playwright-cli -s=reflex-B resize 1440 900
playwright-cli -s=nextjs-B open --browser=chrome
playwright-cli -s=nextjs-B resize 1440 900

# Then loop the 11 module/page pairs (see d474493 for the exact list).
# Notably, operations/daily-procedures uses the slug remap
# operations/daily-procedure-check on Reflex.
```

Three pages should show **continuous cell flash** on both sides
after Milestone B (compared to `d474493` which was a still snapshot):
- pnl/pnl-change (already had filter bar; now also flashes)
- risk/delta-change (already had filter bar; now also flashes)
- portfolio-tools/pay-to-hold (already had filter bar; now also flashes)

Plus the previously-flashing market-data and fx-data.

A still screenshot won't capture the flash; the cells just look
visually identical. The functional confirmation lives in the
DataGrid mocked tests.

Commit:
```
docs(parity-screenshots): re-capture 22 canonical screenshots after Milestone B
```

### 5.9 Continuations.md entry for Milestone B

Append a 2026-05-XX entry summarizing the simulator port + cited
verification numbers. Push.

---

## 6. Phase B — Milestone C (polish)

The 13 sub-tracks from `docs/plans/handoff-prompt-2026-05-10-walk-and-implement.md`
§6.3, augmented by the 9 new findings F-30..F-38 from the walk:

### Recommended order (priority + risk)

| Step | Track | Closes | Notes |
|---|---|---|---|
| 1 | **C1** Search debounce | F-17 | Add 300 ms debounce to `data-grid.tsx` search input. Single jest test. |
| 2 | **C2** Sticky-highlight retry timeout | F-18 | 10 s → 15 s in `lib/grid-registry.tsx`. Update existing `__tests__/gridRegistry.test.tsx`. |
| 3 | **C-30** Auto-refresh switch on calm pages | F-30 | Drop `showAutoRefresh` on the 13 calm pages (5 recon + 4 compliance + 3 market-data calm + instruments/ticker-data). Pure subtractive change. |
| 4 | **C3** Row-group panel | F-12 | Add `showRowGroupPanel` opt-in on the four PnL pages + four compliance grids that have aggFuncs. Confirm 22 canonical screenshots still match — re-shoot if layout shifts past 5 px. |
| 5 | **AskUserQuestion** gates (4 questions) | F-7 / F-21 / F-23 / F-35 | Surface before any C-track that depends on these (C4 / C5 / C7 / C12 below). Recommend Q1 = "remove `market_price`", Q2 = "match Reflex (open)", Q3 = "wait", Q4 = "keep Next.js superset, document". |
| 6 | **C4** Stock-screener filter bar | F-6 | New `<StockScreenerFilterBar>` — DTL10 / Market Cap / ADV 3M / Country multi-select. Jest test for filter state. Wire on the page. |
| 7 | **C5** Reset-dates filter bar | F-7 | New `<ResetDatesFilterBar>` — multi-field. Resolve `market_price` first per AskUserQuestion. |
| 8 | **C-32** Pricer-warrant pricing-results table | F-32 | Mirror F-11 fix (static demo table). |
| 9 | **C6** Pricer-bond pricing-results table | F-11 | 6-row × 10-col demo table. |
| 10 | **C-10/33** Pricer notes panels | F-10 + F-33 | Single shared `NOTES` array (8 items) used by both pricer pages. Closes the missing-bond-notes (F-10) and the truncated-warrant-notes (F-33) at the same time. |
| 11 | **C-34** compliance/beneficial-ownership single-date | F-34 | Swap `<DateRangeFilterBar>` for `<SingleDateFilterBar>` on the page. |
| 12 | **C7** Notification card slide-in | F-19 | Tailwind classes only. |
| 13 | **C8** Top-nav active-tab pulse | F-20 | Tailwind classes only. |
| 14 | **C9** Subtab overflow | F-24 | `overflow-x-auto` → `overflow-hidden no-scrollbar`. |
| 15 | **C10** Toolbar date-picker webkit polish | F-26 | CSS only. |
| 16 | **C11** Notification sidebar default-open | F-21 | Per AskUserQuestion. |
| 17 | **C12** Notification infinite scroll | F-23 | Per AskUserQuestion (likely defer). |
| 18 | **F-35 / F-36 product decision** | F-35 + F-36 | Per AskUserQuestion. May need 0 commits (keep) or N commits (trim). |
| 19 | **F-38 spot-check** | F-38 | Code-level recheck of `events/reverse_inquiry_ag_grid.py` to determine whether the third dateInput is a real filter bar. Document outcome; close out as benign or escalate. |

Each sub-track gets one commit (or 0 if a question kills the scope).

### Milestone C parallelization
After Step 3 lands, dispatch up to 6 agents in parallel on independent
files. Don't dispatch more than 5 simultaneously — the 2026-05-10
session learned that 5 concurrent `git add` operations in the same
worktree can cause one agent's files to get bundled into another's
commit (events files landed inside the orders commit). Stagger or
cap at 5; if collisions happen, document and don't try to rewrite
history.

### Milestone C exit gate

- Every High and Medium item the user authorises is closed.
- Polish is the only remaining diff against Reflex (intentional
  deltas list updated in `docs/parity-screenshots/README.md`).
- Verification matrix all green with cited numbers.
- Final 22-screenshot re-shoot; visually equivalent.
- `continuations.md` entry appended.

---

## 7. Verification matrix (run between commits, cite exact numbers)

```bash
# Frontend
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand
pnpm lint
pnpm build

# Desktop static export (only when src-tauri/ or shared infra changes)
TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 \
  NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build

# Backend
cd ../fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

Expected post-Phase A: TSC clean; Jest ≥ 26 / ≥ 145; Lint 0/0; Web
build PASS; Backend pytest 186/2.

Expected post-Milestone C: depends on sub-tracks taken. Floor:
TSC clean; Jest ≥ 27 / ≥ 150 (debounce + sticky-highlight + row-group
+ filter bars add ~10); Lint 0/0; Web build PASS; Backend pytest 186/2.

Always cite numbers — never just "all green".

---

## 8. Open questions to surface (do not assume)

The 5 from §0 above. Use `AskUserQuestion`. Don't proceed past
the polishing stage where each question matters until you have
the answer.

---

## 9. Recovery from interruption

Standard contract from §14 of the 2026-05-05 brief. After a crash:

1. `git status` is the truth — uncommitted is half-done (finish or stash).
2. `git log --oneline 5f1c7b9..HEAD` shows what landed; cross-reference the §0 commit list.
3. Resume from the first unfinished step in §5 or §6.
4. Run §7 verification matrix. If anything is red, fix before adding new work.

---

## 10. Exit criteria

Done when **all** are true:

1. Phase A (finish Milestone B) commits landed: 1 fix-orders + 3
   simulator commits + 1 screenshot reshoot.
2. Milestone C sub-tracks landed (everything authorised by the user;
   F-7 / F-21 / F-23 / F-35 / F-36 may be deferred per AskUserQuestion).
3. The 22 canonical screenshots re-shot after Milestone C and
   visually equivalent.
4. Verification matrix all green with cited numbers.
5. `git status` clean on `feat/nextjs-fastapi-rebuild`, fully pushed.
6. `continuations.md` has a 2026-05-XX entry summarizing Milestone B
   close + Milestone C close.

---

## 11. Useful one-liners

```bash
# Confirm a Reflex mixin's refresh cadence
grep -n "asyncio.sleep" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/app/states/<module>/mixins/<page>_mixin.py

# Re-capture the 22 canonical parity screenshots
ls docs/parity-screenshots/*/*.png | wc -l    # → 22

# Find unused imports across pages (TS will catch them but a quick grep helps)
grep -rln "import.*Simulator.*from.*grid-simulators" nextjs-frontend/app/dashboard | xargs -I{} grep -L "simulateUpdate=" {}

# Stage just the simulator files for a module
git add nextjs-frontend/lib/grid-simulators/<module>.ts \
        nextjs-frontend/__tests__/<module>Simulators.test.ts \
        nextjs-frontend/app/dashboard/<module>/*/page.tsx
```

---

## 12. Resume prompt (paste into a fresh session)

```text
Resume work in /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read in order before doing anything:
1. docs/plans/handoff-prompt-2026-05-05.md (source of truth)
2. docs/plans/handoff-prompt-2026-05-06.md
3. docs/plans/handoff-prompt-2026-05-07-feature-parity.md
4. docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md
5. docs/plans/handoff-prompt-2026-05-09-feature-parity-audit.md
6. docs/plans/handoff-prompt-2026-05-10-walk-and-implement.md
7. docs/plans/handoff-prompt-2026-05-11-finish-milestone-b-and-c.md (THIS BRIEF)
8. docs/parity-audit/2026-05-09/findings.md (F-1..F-38 work list)
9. docs/parity-audit/2026-05-09/route-matrix.md (50/50 PASS or MISMATCH)
10. continuations.md (newest first)

Baseline: HEAD `b6addcf`, 8 commits ahead of origin. Tree is dirty —
3 events pages modified + events.ts + eventsSimulators.test.ts +
this brief untracked. All other Milestone B simulator commits already
landed (B1 pnl, B2 positions, B3 risk + portfolio-tools, B4 instruments,
B5 operations + orders + market-data-historical). The B4 events code
got orphaned by B5's `git reset --soft HEAD~1` — see §0/§0.1 in the
brief — so the next session just needs to commit those 5 files.

Milestone A is closed (verified at d474493).

Phase A — finish Milestone B (~3 commits):
1. feat(events): add client-side simulators for live cell flash
2. (sanity check orders/emsx-order has the simulateUpdate prop wired —
   tsc would catch otherwise; if missing, fix-commit it)
3. docs(plans): handoff brief for finishing Milestone B and running Milestone C
4. docs(parity-screenshots): re-capture 22 canonical screenshots after Milestone B

Push, run §7 verification matrix, cite exact numbers. Update continuations.md.

Phase B — Milestone C polish (~12-18 commits depending on AskUserQuestion outcomes).
See §6 of the 2026-05-11 brief for the ordered sub-track list.

Hard rules:
- Reflex at :3001/pmt/ is the spec — read, run, screenshot.
- One commit per defect; push every 2-3 commits.
- Cite exact numbers; never "all green".
- AskUserQuestion before F-7 / F-21 / F-23 / F-35 / pytest-target choices.
- Don't break the 22 canonical screenshots.
- Don't dispatch more than 5 parallel agents (the 2026-05-10 session
  hit a git-add race with 5; one agent's files landed inside another's
  commit).

Three-terminal setup with bypass flags ON (see §4 of 2026-05-11 brief).

Run §7 verification matrix between commits and report exact PASS/FAIL counts.

Exit criteria in §10: every Blocker+High closed unless explicitly deferred;
verification matrix green; continuations.md entry; tree clean and pushed.
```

---

End of 2026-05-11 finish-Milestone-B-and-C handoff.
