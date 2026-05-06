# Portfolio Management Tool — Full Browser Walk + Parity Implementation Handoff (2026-05-10)

This brief follows the chain of 2026-05-05 → 05-06 → 05-07 → 05-08 →
05-09 handoffs. The 2026-05-09 audit produced **22 numbered findings
(F-1..F-29)** without writing code; this brief asks the next team to
**(1) walk every dashboard route in a browser, side-by-side with
Reflex, to confirm and expand the audit**, and **(2) close every
finding the user authorises** in three milestones.

The audit's `findings.md` and `route-matrix.md` are the spec for this
session. Read them first. Reflex (`:3001/pmt/`) is the spec for any
behaviour question.

---

## 0. Verified state at session start (audit close, HEAD `5f1c7b9`)

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | **13 suites / 69 tests** in 1.019 s |
| `pnpm lint` | 0 errors / 0 warnings |
| `pnpm build` (web) | PASS — exit 0 |
| Backend pytest (sqlite override) | **175 passed, 2 skipped in 7.83 s** |
| `git status` | clean except for the 2026-05-09 audit docs (untracked) |

Auth-bypass flags are wired (`PMT_AUTH_DISABLED=true` /
`NEXT_PUBLIC_AUTH_DISABLED=1`) so the browser walk runs without
logging in.

---

## 1. Mission

Two phases, one branch (`feat/nextjs-fastapi-rebuild`):

**Phase 1 — Full browser walk (research only, no code).** Walk every
one of the 49 dashboard routes in `nextjs-frontend/lib/constants.ts`
with two named playwright-cli sessions side-by-side. For each route:
diff the columns, filters, toolbars, status bar, sample row values,
sort/filter behaviour, auto-refresh cadence, cell flash, empty /
loading / error states, and any page-specific interactions (forms,
calculators, context menus, generate dropdowns). Update the
`route-matrix.md` to mark every "NOT TESTED" row as **PASS** or
**MISMATCH** with a short evidence pointer (DOM probe + screenshot).
Append any new findings (F-30, F-31, …) to `findings.md`.

**Phase 2 — Implement parity in three milestones.** Close every
Blocker + High in `findings.md`. Milestones run sequentially; within
a milestone, dispatch parallel agents on independent files. Stop at
Milestone B if the user wants a checkpoint before polish.

---

## 2. Reading order

Before touching anything:

1. `docs/plans/handoff-prompt-2026-05-05.md` — convergence loop, per-page acceptance gate, hard rules.
2. `docs/plans/handoff-prompt-2026-05-06.md` — auth-bypass workflow, OpenAPI baseURL bootstrap.
3. `docs/plans/handoff-prompt-2026-05-07-feature-parity.md` — toolbar / status-bar / grid-runtime feature pass (closed).
4. `docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md` — live-flash + cross-page jump (closed).
5. `docs/plans/handoff-prompt-2026-05-09-feature-parity-audit.md` — audit handoff.
6. **`docs/parity-audit/2026-05-09/findings.md`** — 22 numbered findings; this is the work list.
7. **`docs/parity-audit/2026-05-09/route-matrix.md`** — 50-row matrix, 38 rows currently `NOT TESTED`.
8. `docs/parity-screenshots/README.md` — already-documented intentional deltas.
9. `continuations.md` — most recent entry first.

---

## 3. Hard rules

All rules from §13 of the 2026-05-05 brief still hold. Plus:

1. **Reflex is the spec.** Every behaviour answered by reading
   `Portfolio-Management-Tool-reflex/`, running `:3001/pmt/`, and
   DOM-probing it. Do not guess.
2. **Verify before fixing.** The 2026-05-09 audit revised several
   prior-brief claims (e.g. "4 recon pages missing date filter" was
   wrong — all 5 are wired). Trust nothing without a grep + browser
   probe.
3. **Phase 1 is read-only.** No code changes during the walk.
4. **One commit per defect** in Phase 2. F-1 (backend) + F-8 (UI)
   are two commits, not one.
5. **Push every 2-3 commits.**
6. **Cite exact numbers.** Never "all green".
7. **Surface scope before >2 hours of work** for anything not in
   the audit's "Recommended next implementation order".
8. **Don't break the 22 canonical screenshots.** Re-shoot them
   after each milestone; visually diff against the committed PNGs.
9. **Auth-bypass flags must default OFF in any committed env example.**
10. **Don't hand-edit `nextjs-frontend/app/openapi-client/`.**
    Regenerate via `pnpm generate-client` against a running backend.
11. **No new state-management or charting library** without surfacing.
12. **Storage-key namespace** (`pmt:next:` prefix) and
    notification-route slug map in `lib/notification-routes.ts` are
    the agreed conventions — extend them, don't replace.

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
`curl -I :3001/pmt/`) before walking. **All three must return 200.**

Note Reflex slug differences (already documented in F-29):
- Next `market-data/ticker-data` ↔ Reflex `market-data/reference-data`
- Next `instruments/special-terms` ↔ Reflex `instruments/special-term` (singular)
- Next `operations/daily-procedures` ↔ Reflex `operations/daily-procedure-check`

---

## 5. Phase 1 — Full per-route browser walk

### 5.1 Methodology

Two named sessions at 1440×900:

```bash
playwright-cli -s=reflex open --browser=chrome
playwright-cli -s=reflex resize 1440 900
playwright-cli -s=nextjs open --browser=chrome
playwright-cli -s=nextjs resize 1440 900
```

For each of the 49 routes, in matrix order (`route-matrix.md`):

1. **Navigate both sides.** Mind the slug map for the three Reflex
   routes that differ.
2. **Capture screenshots.** Save under
   `docs/parity-audit/2026-05-09/artifacts/<module>/<page>-{reflex,nextjs}.png`.
   Don't overwrite the canonical 22 in `docs/parity-screenshots/`;
   put walk evidence under `parity-audit/`.
3. **DOM probe both sides.** One `eval` per session, capture the
   below into a JSON object you append to a per-route notes file:

   ```js
   () => {
     const headers = [...document.querySelectorAll('.ag-header-cell-text')].map(e => e.textContent.trim());
     const rows = document.querySelectorAll('.ag-row').length;
     const dateInputs = document.querySelectorAll('input[type="date"]').length;
     const compactBtn = [...document.querySelectorAll('button')].some(b => /compact/i.test(b.textContent || ''));
     const autoRefresh = !!document.querySelector('[role="switch"], [aria-label*="auto" i]');
     const exportBtn = [...document.querySelectorAll('button')].some(b => /export/i.test(b.textContent || ''));
     const sidebar = !!document.querySelector('[class*="notification"]');
     const statusBar = !!document.querySelector('.ag-status-bar');
     const overlay = document.querySelector('.ag-overlay-no-rows-wrapper, .ag-overlay-loading-wrapper');
     const overlayText = overlay?.textContent?.trim() ?? null;
     return JSON.stringify({ headers, rows, dateInputs, compactBtn, autoRefresh, exportBtn, sidebar, statusBar, overlayText });
   }
   ```
4. **Interactive probes** for the items the brief calls out:
   - Sort: click a header, snapshot, undo.
   - Filter: type into floating filter, snapshot row count, clear.
   - Range select: drag across 3×3 cells, snapshot `.ag-cell-range-selected` count.
   - Auto-refresh: wait 5 s, observe Last Updated change.
   - Cell flash: wait 5 s, snapshot `.ag-cell-data-changed` count (>=1 expected on live pages).
   - Notification jump: click a notification whose `grid_id` matches the current page → snapshot `.pmt-notification-highlight` count.
   - Context menu: right-click a row → snapshot menu items list.
5. **Compare** the two snapshots. Pass / Mismatch per the matrix
   columns.
6. **Update `route-matrix.md`** in place: change the route's "Browser
   parity" cell from `NOT TESTED` to `PASS` or `MISMATCH`. If
   mismatch, link to the new finding ID.
7. **Append new findings** to `findings.md` continuing from F-30,
   following the same template (Reflex source, Next.js source,
   browser repro, suggested fix, risk).

### 5.2 Parallelisation

Spawn five **Explore** sub-agents in parallel — each handles one
slice of the route list, drives its own playwright-cli sessions
(`-s=reflex-N` / `-s=nextjs-N`), writes per-route notes to a
sub-folder, and returns a delta list for `findings.md`. Slices:

- Agent W1: market-data (6) + positions (5) = 11 routes
- Agent W2: pnl (4) + risk (5) = 9 routes (includes 2 pricer forms)
- Agent W3: recon (5) + compliance (4) = 9 routes
- Agent W4: portfolio-tools (9) = 9 routes
- Agent W5: instruments (5) + events (3) + operations (2) + orders (2) = 12 routes

Each agent:
- Uses its own playwright-cli session names to avoid cross-talk.
- Writes notes under `docs/parity-audit/2026-05-09/artifacts/walk-W<N>/`.
- Returns a structured list of route → status + new finding IDs.

After all five complete, merge the deltas into the canonical
`findings.md` + `route-matrix.md`. Commit:
`docs(parity-audit): full per-route browser walk on 49 routes`.

### 5.3 Phase 1 exit gate

Phase 1 is complete when:

- Every row in `route-matrix.md` is **PASS** or **MISMATCH** — zero
  `NOT TESTED`.
- Every Mismatch row points to a finding ID in `findings.md`.
- Total finding count is recorded (was 22 at audit close; expect
  +5 to +15 after the full walk — be conservative, only flag real
  defects).
- Verification matrix unchanged from §0 (Phase 1 doesn't touch
  source).
- One commit lands; pushed.

---

## 6. Phase 2 — Implement parity in milestones

### 6.1 Milestone A — backend + filter bars (4 Blockers + 4 High)

Closes: F-1, F-3, F-4, F-8, F-15, F-16, F-29 (+ any equivalents from
the Phase 1 walk).

**Estimated scope:** half a day, ~12 commits, no new dependencies.

#### Milestone A commits, in order

1. **F-29 first (cheap warmup).** Add slug aliases to
   `lib/notification-routes.ts`: `special-term → special-terms`,
   `daily-procedure-check → daily-procedures`. Pure-function jest
   covering each.
   `feat(notifications): alias slug overrides for special-term + daily-procedure-check`

2. **F-15.** Add `position_date: date | None = Query(None)` to
   `fastapi_backend/app/routes/compliance.py::get_undertakings`;
   thread to existing `pmt_core` service. Backend pytest 200 + 401
   + 200 with date filter. Regenerate the OpenAPI client.
   `feat(compliance): accept position_date on /undertakings`

3. **F-16.** Same shape for
   `fastapi_backend/app/routes/instruments.py::get_special_terms`,
   accepting `pos_date`.
   `feat(instruments): accept pos_date on /special-terms`

4. **F-1.** Two backend POST routes:
   `POST /api/operations/processes/{id}/rerun` and
   `POST /api/operations/processes/{id}/kill`. Wrap
   `pmt_core.services.operations.rerun_process` and `kill_process`.
   Pytest 200 + 401 each. Regenerate the OpenAPI client.
   `feat(operations): expose rerun + kill POST routes`

5. **F-3 (page 1 of 4).** `pnl/pnl-change/page.tsx` — add
   `<SingleDateFilterBar>`, thread `position_date` through
   `pnlGetPnlChanges`. Add `rowIdKey="ticker"`.
   `feat(pnl): add position-date filter bar on pnl-change`

6. **F-3 (pages 2-4).** Same template on `pnl-summary`,
   `pnl-currency`, `pnl-full`, with respective `rowIdKey` from the
   `GRID_ROW_ID_KEYS` table in `lib/notification-routes.ts`. Three
   commits.

7. **F-4 (3 portfolio-tools pages).** Same template on
   `portfolio-tools/{pay-to-hold, cb-installments, excess-amount}`.
   Three commits.

8. **F-8 + F-1 wiring.** New helper
   `components/operations/operations-context-menu.ts` exporting
   `getOperationsContextMenuItems(api, { onRerun, onKill })`. Wire on
   `dashboard/operations/{daily-procedures, operation-process}/page.tsx`.
   Calls the F-1 POST routes; on success, refetch.
   `feat(operations): rerun + kill context menu`

#### Milestone A exit gate

- Every Blocker + High from F-1, F-3, F-4, F-8, F-15, F-16, F-29 is
  closed.
- Verification matrix all green; cite exact numbers.
- Re-shoot the 22 canonical screenshots in `docs/parity-screenshots/`;
  diff against committed PNGs to confirm no regression.
- `continuations.md` entry summarising Milestone A.

### 6.2 Milestone B — live-data feel rollout (F-2 + F-22)

**Estimated scope:** one full day. ~28 commits.

The work in `lib/grid-simulators.ts` + per-page wiring.

#### Step 1 — wrapper-level change
Make `simulateUpdate` implicitly drop `autoRefreshIntervalMs` to the
simulator's interval when the prop is set, unless the page explicitly
overrides. This means a simulator-equipped page no longer needs to
also pass `autoRefreshIntervalMs={2_000}`.
`feat(grid): when simulateUpdate is set, default autoRefreshIntervalMs to simulator cadence`

#### Step 2 — port simulators in priority order
Group by module, one commit per module. Each module's simulator
file lives at `lib/grid-simulators/<module>.ts` re-exported through
`lib/grid-simulators.ts`.

| Module | Simulators to add | Reflex source |
|---|---|---|
| pnl | pnl-change, pnl-summary, pnl-currency, pnl-full (4) | `app/states/pnl/mixins/*.py` |
| positions | positions, stock-position, warrant-position, bond-positions, trade-summary (5) | `app/states/positions/mixins/*.py` |
| risk | delta-change, risk-measures, risk-inputs (3) | `app/states/risk/mixins/*.py` |
| portfolio-tools | 9 pages | `app/states/portfolio_tools/mixins/*.py` |
| instruments | ticker-data, stock-screener, special-terms, instrument-data, instrument-term (5) | `app/states/instruments/mixins/*.py` |
| events | event-calendar, event-stream, reverse-inquiry (3) | `app/states/events/*.py` |
| operations | daily-procedures, operation-process (2) | `app/states/operations/mixins/*.py` |
| orders | emsx-order, emsx-route (2) | `app/states/emsx/mixins/*.py` |
| market-data | historical-data (5 s, not 2 s) (1) | `app/states/market_data/mixins/historical_data_mixin.py:71` |

For each simulator: read the Reflex `simulate_*_update()` function
verbatim, port the mutation rules to TS (typically: pick 1-5 random
rows, mutate `last_price` ±1 %, `change` between -5 and +5,
`volume` ±2 %; non-numeric rows untouched). Jest fake-timer test
asserting the function returns a new reference and at least one
numeric field changed.

#### Step 3 — pages compliance/recon stay flat
Compliance + recon are static / EOD. **Do not** add simulators.
Reflex doesn't either.

#### Parallelisation
After Step 1 lands, dispatch up to **5 sub-agents** working different
modules in parallel. Each agent owns one module from the table above
and ships its commits independently. Use git rebase if two agents
collide on `lib/grid-simulators.ts`'s barrel exports.

#### Milestone B exit gate

- 26 simulator-eligible pages now show continuous cell flash at the
  Reflex cadence (verified by playwright-cli walking each page and
  asserting `.ag-cell-data-changed` count > 0 after 5 s).
- Backend `autoRefreshIntervalMs` polling is sane on every page (no
  page hammers the backend more than once per ~10 s).
- Verification matrix all green.
- Continuations entry.

### 6.3 Milestone C — polish

Closes: F-6, F-7, F-10, F-11, F-12, F-17, F-18, F-19, F-20, F-21,
F-22-residue, F-23, F-24, F-25, F-26, plus any new Phase 1 findings.

#### Sub-tracks

- **C1: Search debounce (F-17).** Add 300 ms debounce to
  `data-grid.tsx` search input. Single jest test.
- **C2: Sticky-highlight retry timeout (F-18).** 10 s → 15 s in
  `lib/grid-registry.tsx`. Update existing
  `__tests__/gridRegistry.test.tsx`.
- **C3: Row-group panel (F-12).** Add `showRowGroupPanel?: boolean`
  prop to `<DataGrid>`; opt-in on the four PnL pages and three
  compliance grids that ship aggFuncs. Confirm the existing 22
  screenshots aren't pushed off-layout (re-shoot if they are).
- **C4: Stock-screener filter bar (F-6).** New
  `<StockScreenerFilterBar>` — DTL10 / Market Cap / ADV 3M / Country
  multi-select. Jest test for filter state. Wire on the page.
- **C5: Reset-dates filter bar (F-7).** Same pattern; multi-field.
  **Surface the `market_price` column ambiguity to the user via
  `AskUserQuestion` first** — keep it (Next.js enhancement) or remove
  it (match Reflex)?
- **C6: Pricer-bond Pricing Results table (F-11) + bond-specific
  notes (F-10).** Static demo table or wire to a small
  `pmt_core.services.pricing.bond_pricing_grid()` if available.
- **C7: Notification card slide-in (F-19).** Tailwind classes only.
- **C8: Top-nav active-tab pulse (F-20).** Tailwind classes only.
- **C9: Subtab overflow (F-24).** `overflow-x-auto` →
  `overflow-hidden no-scrollbar` on `subtab-navigation.tsx`.
- **C10: Toolbar date-picker webkit polish (F-26).** CSS only.
- **C11: Notification sidebar default-open (F-21).** **Surface to
  user via `AskUserQuestion`** — match Reflex (open) or keep
  collapsed?
- **C12: Notification infinite scroll (F-23).** **Surface to user
  via `AskUserQuestion`** — port now or wait for >50 notifications?

#### Milestone C parallelisation
Each sub-track is independent. Dispatch up to 6 agents in parallel
on independent files. Agents must pull/rebase before each commit if
the tree moved.

#### Milestone C exit gate

- Every High and Medium item the user authorises is closed.
- Polishes are the only remaining diffs against Reflex (see
  documented intentional deltas).
- Verification matrix all green.
- Final 22-screenshot re-shoot; visually equivalent.
- Final continuations entry.

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

Expected at session start: TSC clean, Jest 13/69, Lint 0/0, Web
build PASS, Backend pytest 175 / 2 skipped.

Expected after Milestone A: Jest grows by ~5 (slug aliases,
filter-bar smoke); pytest grows by ~6 (operations rerun/kill x 2 and
date filter on undertakings + special-terms).

Expected after Milestone B: Jest grows by ~26 (one per simulator).

Expected after Milestone C: depends on sub-tracks taken; typically
+8 jest, +0 pytest.

---

## 8. Open questions to surface before coding

Use `AskUserQuestion` for each. Don't decide unilaterally.

1. **Phase 1 scope.** "Full per-route walk" ≈ 49 routes × ~1-2 min
   per route × 5 agents ≈ 30-45 minutes wall-clock. Confirm the
   user wants the full walk before any implementation, or wants
   Milestone A done first then walk afterwards.
2. **F-7 reset-dates `market_price` column.** Keep (Next.js
   enhancement) or remove (match Reflex)?
3. **F-22 simulator scope.** Reflex simulates 26 pages. Confirm full
   port or subset (e.g. skip operations + orders if the user feels
   they shouldn't tick at 2 s in production).
4. **F-21 notification sidebar default-open state.** Open by default
   to match Reflex's first-paint, or keep collapsed?
5. **F-23 notification infinite scroll.** Worth porting or wait
   until the notification dataset grows past ~50?
6. **F-9 (3-D pricer chart) + F-27 (mobile nav) + F-28 (Reflex
   ticker-data divergence)** — confirmed out of scope for this
   round, or reprioritise any?
7. **Backend pytest count target.** Currently 175. After Milestone
   A, the user may want to backfill route-level tests to the
   historic 116-versus-175 baseline question — leave this until A
   lands and ask explicitly.
8. **AG Grid Enterprise license.** Both apps run on the trial
   license; Milestone B's volume of cell flashes will increase the
   "trial license" console noise. Surface if the user wants to
   procure a key first.

---

## 9. Recovery from interruption

Standard contract from §14 of the 2026-05-05 brief. After a crash:

1. `git status` is the truth — uncommitted is half-done (finish or stash).
2. `git log --oneline -50` shows what landed; cross-reference §6 of this brief.
3. Resume from the first unchecked commit in the milestone.
4. Run §7 verification matrix. If anything is red, fix before adding new work.

---

## 10. Exit criteria for the whole session

Done when **all** are true:

1. Phase 1 walk complete; every row in `route-matrix.md` is **PASS**
   or **MISMATCH** (zero `NOT TESTED`).
2. Every Blocker + High in `findings.md` (including any new F-30+
   from Phase 1) is closed unless explicitly deferred by the user.
3. The 22 canonical screenshots re-shot and visually equivalent.
4. Verification matrix all green with cited numbers.
5. `git status` clean on `feat/nextjs-fastapi-rebuild`, fully pushed.
6. `continuations.md` has a 2026-05-XX entry summarising the Phase 1
   walk + the milestones landed.
7. The audit's "Recommended next implementation order" in
   `findings.md` is fully closed up to where the user paused.

---

## 11. Resume prompt (paste into a fresh Claude Code session)

```text
Resume work in /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read in order before doing anything:
1. docs/plans/handoff-prompt-2026-05-05.md (source of truth)
2. docs/plans/handoff-prompt-2026-05-06.md
3. docs/plans/handoff-prompt-2026-05-07-feature-parity.md
4. docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md
5. docs/plans/handoff-prompt-2026-05-09-feature-parity-audit.md
6. docs/plans/handoff-prompt-2026-05-10-walk-and-implement.md (THIS BRIEF)
7. docs/parity-audit/2026-05-09/findings.md (the work list)
8. docs/parity-audit/2026-05-09/route-matrix.md (38 rows currently NOT TESTED)
9. docs/parity-screenshots/README.md (intentional deltas)
10. continuations.md (newest first)

Baseline (HEAD 5f1c7b9): tsc clean, jest 13/69 in 1.019s, lint 0/0, web build PASS, backend pytest 175 passed / 2 skipped.

Two phases:

PHASE 1 — Full per-route browser walk (read-only).
Three terminals up with bypass flags. Two playwright-cli sessions per agent at 1440x900. Walk all 49 routes in route-matrix.md order. For each: navigate both sides (mind Reflex slug differences for ticker-data/special-terms/daily-procedures), capture screenshot pair under docs/parity-audit/2026-05-09/artifacts/, run the DOM probe in §5.1 Step 3, run the interactive probes in §5.1 Step 4 (sort/filter/range-select/auto-refresh/cell-flash/notification-jump/context-menu), update route-matrix.md to mark every row PASS or MISMATCH, append new findings F-30+ to findings.md.

Parallelise across 5 sub-agents per the slice in §5.2 (W1: market-data+positions, W2: pnl+risk, W3: recon+compliance, W4: portfolio-tools, W5: instruments+events+operations+orders). Each agent uses its own playwright-cli session names. After all five complete, merge deltas, commit `docs(parity-audit): full per-route browser walk on 49 routes`.

Phase 1 exit: every row in route-matrix.md is PASS or MISMATCH; total finding count recorded; tree clean.

PHASE 2 — Implement parity in three milestones (sequential).

Milestone A — backend + filter bars. Closes F-29, F-15, F-16, F-1, F-3 (4 pages), F-4 (3 pages), F-8. ~12 commits. Re-shoot the 22 canonical screenshots after.

Milestone B — live-data feel. Wrapper-level change so simulateUpdate implicitly drops autoRefreshIntervalMs, then port 26 simulators across pnl/positions/risk/portfolio-tools/instruments/events/operations/orders/market-data-historical. Parallelise across 5 agents per module.

Milestone C — polish. Search debounce, sticky-highlight timeout, row-group panel, stock-screener filter, reset-dates filter, pricer-bond pricing-results table, polish.

Hard rules:
- Reflex at :3001/pmt/ is the spec — read, run, screenshot.
- Phase 1 is read-only.
- One commit per defect; push every 2-3 commits.
- Cite exact numbers; never "all green".
- AskUserQuestion before: §8 questions 1-8 (Phase 1 scope, market_price column, simulator scope, sidebar default-open, infinite scroll, intentional deltas, pytest target, Enterprise license).
- Don't break the 22 canonical screenshots.

Three-terminal setup with bypass flags ON (see §4).

Run §7 verification matrix between commits and report exact PASS/FAIL counts.

Exit criteria in §10: every Blocker+High closed unless explicitly deferred; route-matrix all PASS or accepted MISMATCH; verification matrix green; continuations.md entry; tree clean and pushed.
```

---

End of 2026-05-10 walk-and-implement handoff.
