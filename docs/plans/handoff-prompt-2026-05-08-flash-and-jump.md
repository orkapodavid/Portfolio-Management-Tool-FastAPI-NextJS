# Live-Data Feel + Notification Jump — Codex Investigation Brief (2026-05-08)

This brief follows the 2026-05-05 / 05-06 / 05-07 / 05-08 handoffs (read
each in order — the convergence loop in §5 of the 2026-05-05 brief
still applies). The 2026-05-08 session closed the toolbar / filter-bar
/ pytest gaps and shipped 10 commits on `feat/nextjs-fastapi-rebuild`,
but **two parity defects remain visible to the user when sitting on
`/dashboard/market-data` with Auto Refresh ON** and **clicking a
notification's "go to details" arrow**:

1. **Cells don't flash on Next.js (`:3000`) the way they constantly
   flash on Reflex (`:3001/pmt/market-data`).**
2. **Clicking a notification on Next.js doesn't navigate to the
   target grid + row + flash the cell.** Reflex does.

This brief diagnoses both, names the exact files involved, and lays
out the work for a team of Codex agents to investigate, compare, fix,
and verify against Reflex side-by-side.

---

## 1. Mission

Bring the live-data feel + notification-jump UX of `:3000` to true
parity with `:3001/pmt/`. After this brief lands, a user sitting on
the same page in both apps should see:

- The same cadence of cell flashes (Reflex flashes 1–5 random cells
  every ~2 s on market-data).
- Identical behaviour when clicking a notification: navigate to the
  target page if not already there, then scroll the matching row
  into view, flash the changed cells, and apply a sticky highlight
  for ~1.8 s while AG Grid re-renders rows during scroll/sort.

Until both behave the same, this is not done.

---

## 2. Verified state at session start (2026-05-08, HEAD `e583fed`)

| Check | Result |
|---|---|
| Branch | `feat/nextjs-fastapi-rebuild`, fully pushed to origin |
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec jest --runInBand` | 12 suites / 50 tests in 1.007 s |
| `pnpm lint` | 0 / 0 |
| `pnpm build` (web) | PASS — 59 routes |
| `TAURI_BUILD=1 … pnpm build` | PASS |
| Backend pytest (sqlite override) | **175 passed, 2 skipped in 7.82 s** |
| Auth-bypass flags | `PMT_AUTH_DISABLED=true` (backend) and `NEXT_PUBLIC_AUTH_DISABLED=1` (frontend) wired |

The earlier 2026-05-08 work landed:
- `defaultAutoRefreshOn = true` when `showAutoRefresh` is set.
- `lastUpdated` populates on the first successful load (was `—`).
- `getRowId` is now omitted when `rows[0][rowIdKey]` is undefined,
  so AG Grid falls back to internal index-based reconciliation
  instead of collapsing every row onto the same id.

These changes are correct and prerequisite — they just don't make
flashes appear because the **two upstream signals** that feed the
flash pipeline are still wrong (see §4).

---

## 3. Hard rules (read before changing code)

All rules from §13 of the 2026-05-05 brief still hold. Plus:

1. **Reflex is the spec.** Every behaviour question gets answered by
   reading the reference at `/Users/orbot/Developer/work/Portfolio-Management-Tool-reflex`,
   running `:3001/pmt/`, and screenshotting / DOM-inspecting it. Do not
   guess.
2. **Don't break already-converged pages.** The 48 dashboard pages
   ship `<DataGrid>` with consistent props; changes to the wrapper or
   to the registry must not break the existing parity screenshots
   (re-verify the 22 PNGs after).
3. **No new state-management library.** `useState + useRef +
   setInterval + sessionStorage` is enough.
4. **Don't add AG Grid Enterprise features that need a license**
   beyond what's already in. `enableCellChangeFlash`, `flashCells`,
   `ensureNodeVisible` are all Community.
5. **Don't regenerate `package-lock.json`.** pnpm-only.
6. **Don't hand-edit `nextjs-frontend/app/openapi-client/`.**
   Regenerate via `pnpm generate-client` against a running backend.
7. **Auth-bypass flags must default OFF in any committed env example.**
8. **Cite exact numbers between commits.** `X passed, T seconds`,
   never "all green".
9. **Commit per defect fix.** Each of the four pieces in §6 ships its
   own commit; don't bundle.

---

## 4. Findings — what's actually wrong

### 4.1 Why cells don't flash on Next.js market-data

Three independent failures stack on top of each other. Fixing one
without the others won't make cells flash.

#### 4.1.1 Refresh interval mismatch (15×)

| Side | Interval | Source |
|---|---|---|
| Reflex market-data | **2 seconds** | `Portfolio-Management-Tool-reflex/app/states/market_data/mixins/market_data_mixin.py:39-45` (`asyncio.sleep(2)`) |
| Reflex fx-data | 2 seconds | `fx_data_mixin.py` (same pattern) |
| Reflex other modules | per-mixin (most are 2-5 s) | grep `asyncio.sleep` under `app/states/*/mixins/` |
| Next.js (all grids) | **30 seconds** | `nextjs-frontend/components/grid/data-grid.tsx:171` (`autoRefreshIntervalMs = 30_000`) |

The 2026-05-07 brief said "Don't change the default auto-refresh
interval below 30 s (it implies more API load)" — **that constraint is
wrong for parity**. Reflex doesn't hit a backend on each tick (see
§4.1.2), so its 2-second cadence imposes zero real network load.
Matching Reflex's cadence on Next.js without adjusting §4.1.2 *would*
mean 15× more API calls — so they must be fixed together.

**Action** — make `autoRefreshIntervalMs` per-page-tunable (default
30 s as a backstop, but pages that emulate Reflex's per-mixin cadence
opt down). For the market-data page specifically, drop to 2 s once
§4.1.2 is fixed. Surface to the user before committing if you'd rather
keep 30 s as the wrapper default and let pages override.

#### 4.1.2 Backend mock is deterministic

`pmt_core_pkg/pmt_core/repositories/market_data/market_data_repository.py`
returns the **same** rows on every call (no random jitter). When
Next.js refetches every 30 s and replaces the `rows` array, AG Grid
reconciles row-by-row (now correctly, after §4.1.3 of the prior
session's row-id fix), sees identical values cell-by-cell, and
**doesn't flash anything** — no value changed.

Reflex sidesteps this entirely by *simulating* updates client-side:

```python
# Portfolio-Management-Tool-reflex/app/states/market_data/mixins/market_data_mixin.py:53-74
def simulate_market_data_update(self):
    """Simulated delta update for demo - called by rx.moment interval."""
    if not self.market_data_auto_refresh or len(self.market_data) < 1:
        return
    for _ in range(random.randint(1, min(5, len(self.market_data)))):
        idx = random.randint(0, len(self.market_data) - 1)
        row = self.market_data[idx]
        if "last_price" in row and row["last_price"]:
            row["last_price"] = round(
                float(row["last_price"]) * random.uniform(0.99, 1.01), 2
            )
        if "change" in row:
            row["change"] = round(random.uniform(-5, 5), 2)
        if "volume" in row and row["volume"]:
            row["volume"] = int(float(row["volume"]) * random.uniform(0.98, 1.02))
    ...
```

Two paths to parity, with very different scope:

| Option | Description | Trade-off |
|---|---|---|
| **A. Backend jitter** | Add small random noise to `pmt_core` mock repositories on each call (2 % price, ±5 % volume, etc.). Same approach for every list endpoint that the user might watch live. | Backend still gets hit every tick. Easier to verify with curl. Affects every consumer (Reflex too — but Reflex doesn't call the backend). |
| **B. Client-side simulation** | Add a per-page `simulateUpdate(rows): rows` hook (or inline `useEffect`) that mutates 1–5 random rows in place between fetches, mirroring Reflex's mixin behaviour. Refetch from backend on a slower cadence (30 s) for "real" updates. | Matches Reflex 1:1 in cadence + visual. More code per page. Needs to be opt-in via a `<DataGrid>` prop. |

**Surface to the user via `AskUserQuestion` before picking.** Option B
matches Reflex exactly; option A is simpler but adds drift between
runs that may break other tests.

If picking option B, place the simulator in
`nextjs-frontend/lib/market-data-simulator.ts` (or co-located in the
page) and pass `simulateBetweenRefreshes` to `<DataGrid>`. The wrapper
should set a 2 s `setInterval` for the simulator and a 30 s
`setInterval` for the backend refresh.

#### 4.1.3 Flash duration is AG Grid default

AG Grid v35 defaults: `cellFlashDuration: 500 ms`, `cellFadeDuration:
1000 ms`. Total visible flash ≈ 1.5 s. Both apps inherit these
defaults — confirm by inspecting
`nextjs-frontend/node_modules/ag-grid-community/dist/types/src/gridOptionsDefault.d.ts:87-88`
and the matching path under reflex's `.web/node_modules`.

The user's question — *"How long does it flash once when Auto Refresh
is on?"* — is **500 ms peak + 1000 ms fade = ~1.5 s**, not configured
anywhere on either side. Don't change it; if you do, change it the
same way on both sides via `gridOptions.cellFlashDuration` /
`cellFadeDuration` props on `<AgGridReact>`.

### 4.2 Why notification click doesn't redirect

`nextjs-frontend/components/layout/notification-sidebar.tsx:152-155`
does this and only this when the user clicks the "go to details"
arrow:

```tsx
const handleGoToDetails = (notification: NotificationItem) => {
  if (!registry || !notification.gridId || !notification.rowId) return;
  registry.jumpToRow(notification.gridId, notification.rowId);
};
```

`jumpToRow(gridId, rowId)` lives in `nextjs-frontend/lib/grid-registry.tsx`
and works only if `gridId` is currently mounted in the registry — i.e.
the user is **already on that page**. If the user is on
`/dashboard/market-data/market-data` and clicks a notification for
`pnl_change_grid`, the registry has no entry, `jumpToRow` returns
`false`, and the click silently does nothing. **This is the bug.**

Reflex's equivalent is in
`Portfolio-Management-Tool-reflex/app/states/notifications/notification_sidebar_state.py:206-428`
(`navigate_to_item`). The full algorithm:

```
1. Read notification.module + notification.subtab
2. Build target_route = "/{module-slug}/{subtab-slug}"
3. Check if target grid is on the current page (DOM probe)
4. If yes  → call grid.api.ensureNodeVisible() + flashCells() +
              apply a sticky `.notification-highlight` class for
              ~1.8 s, re-applying every 200 ms via setInterval
              (because AG Grid re-renders rows on scroll/sort).
5. If no   → store {grid_id, row_id, row_id_key} in
              sessionStorage["__pmtPendingHighlight"]
              + rx.redirect(target_route)
              → on the new page, the grid's onGridReady fires
              `execute_pending_highlight(grid_id)` which reads
              sessionStorage, jumps + flashes + sticky-highlights.
```

Notifications already arrive with the right shape:

```bash
$ curl -s http://127.0.0.1:8000/api/notifications/ | python3 -m json.tool | head -16
[
    {
        "id": "pnl-001",
        "category": "Alerts",
        "title": "PnL Alert",
        ...
        "module": "PnL",
        "subtab": "PnL Change",
        "row_id": "AAPL",
        "grid_id": "pnl_change_grid",
        ...
    }
]
```

The Next.js side has `module` and `subtab` available on
`NotificationItem` (verify in `nextjs-frontend/lib/notifications-context.tsx`),
but the sidebar ignores them.

**Action** — port the four pieces:

1. **Slug derivation.** Add a `slugifyRoute({ module, subtab })`
   helper that mirrors Reflex's
   `module.lower().replace(" ", "-")` — special-case
   `"P&L"` → `"pnl"`, `"PnL"` → `"pnl"`, `"Reconciliation"` →
   `"recon"`. Cross-check against `nextjs-frontend/lib/constants.ts`
   to verify the slug matches the actual Next.js route.
2. **Cross-page navigation.** Update `handleGoToDetails`:
   - Try `registry.jumpToRow` first (same-page fast path).
   - On `false`, write `{gridId, rowId, rowIdKey}` to
     `sessionStorage["pmt:next:pendingHighlight"]` (use the
     `pmt:next:` prefix per the storage namespace decision in
     2026-05-07).
   - Call `router.push("/dashboard/" + slugifyRoute(notification))`.
3. **On-mount pickup.** In `lib/grid-registry.tsx`, when a grid
   registers itself, check `sessionStorage["pmt:next:pendingHighlight"]`
   — if it matches the registering `gridId`, call `jumpToRow`, then
   clear the entry. This is the cross-page handoff.
4. **Sticky highlight.** The current implementation re-applies the
   `.pmt-notification-highlight` class at 0/100/350 ms then clears at
   1.8 s. Reflex re-applies every 200 ms throughout the highlight
   window because AG Grid replaces row DOM on scroll. Switch to
   `setInterval(apply, 200)` for the duration, then `clearInterval` +
   final cleanup at 1.8 s.

Add a jest test for `slugifyRoute` (pure function) and a manual
playwright trace for the cross-page jump (record under
`docs/parity-screenshots/notification-jump.webm` if you set up
`video-start` / `video-stop`).

### 4.3 Bonus — pricer pages have no notification jump anyway

Notifications never target pricer pages (no `grid_id` for them).
Out of scope for this brief.

---

## 5. Open questions to surface before coding

Use `AskUserQuestion` for each. Don't decide unilaterally.

1. **Backend jitter (option A) vs client-side simulation (option B)
   in §4.1.2.** Recommend **B** — it matches Reflex 1:1 and doesn't
   pollute the backend mocks for unrelated tests, but it adds
   per-page code. **A** is simpler and changes less code but means
   the backend mocks become non-deterministic (which could break
   future shape-strict pytests).
2. **Per-page refresh cadence.** Reflex uses 2 s for market-data /
   fx-data (truly live data) and longer for end-of-day data
   (positions, pnl). Should Next.js mirror per-page, or pick a
   single 2 s default for everything? Recommendation: per-page,
   matching Reflex; default 30 s for anything not explicitly
   live-tagged.
3. **Slug derivation.** Confirm the slug mapping (`PnL` → `pnl`,
   `P&L` → `pnl`, `Recon` → `recon`, `Portfolio Tools` →
   `portfolio-tools`, `Compliance` → `compliance`, etc.) — there's
   a chance some module label uses different casing in the API
   response vs the Next.js route. Verify before shipping.
4. **localStorage vs sessionStorage for the pending-highlight
   handoff.** sessionStorage is right (cleared on tab close).
   Confirm.

---

## 6. The work — 4 commits, in order

Each commit must pass the §9 verification matrix. Push every 2–3
commits.

### 6.1 Commit A — auto-refresh cadence + per-page override

**Files:**
- `nextjs-frontend/components/grid/data-grid.tsx` — already exposes
  `autoRefreshIntervalMs`. Verify it's wired through to the polling
  `useEffect`.
- `nextjs-frontend/app/dashboard/market-data/market-data/page.tsx`
  — pass `autoRefreshIntervalMs={2000}` (subject to §5.2 answer).
- `nextjs-frontend/app/dashboard/market-data/fx-data/page.tsx` —
  same.
- Decide whether to bump other live-tagged pages similarly.

**Test:**
- Update `nextjs-frontend/__tests__/dataGrid.test.tsx` —
  parametrise the polling test over `1_000` and `2_000` interval
  values; assert the call count after fake timer advance.

**Commit message:** `feat(grid): expose per-page autoRefreshIntervalMs and tune market-data to 2s`

### 6.2 Commit B — value drift between refreshes

Picking **option B** (recommended): add a `simulateUpdate?:
(rows: TRow[]) => TRow[]` prop on `<DataGrid>`. When set, the
wrapper schedules a separate 2 s `setInterval` that calls
`simulateUpdate(rows)` and `setRows(...)` (parent-managed via a
callback prop, OR internal — surface to user). The function
mutates 1–5 random rows by ±1 % on numeric fields.

**Files:**
- `nextjs-frontend/lib/grid-simulators.ts` (new) — exports
  `marketDataSimulator(rows): rows` and `fxDataSimulator(rows): rows`.
- `nextjs-frontend/components/grid/data-grid.tsx` — accept
  `simulateUpdate` prop + interval prop (default 2 s); add the
  `useEffect` that runs alongside auto-refresh.
- `nextjs-frontend/app/dashboard/market-data/market-data/page.tsx`
  + `fx-data/page.tsx` — pass the simulator.

**Test:**
- Jest test that drives fake timers and asserts the simulator was
  called.
- Manual playwright trace (`video-start` / `video-stop`) of the
  Next.js page with simulator on — should look like the Reflex
  page (cells flash continuously).

**Commit message:** `feat(grid): client-side row simulator drives cell flash between refreshes`

If the user picks option A instead, the work is in `pmt_core_pkg`
repositories (mock methods) plus regenerating no client (response
shapes don't change). Add a backend pytest that hits the same
endpoint twice and asserts at least one numeric field changed.

### 6.3 Commit C — slug-driven cross-page navigation

**Files:**
- `nextjs-frontend/lib/notification-routes.ts` (new) — exports
  `slugifyNotificationRoute({ module, subtab }): string` returning
  `"/dashboard/<module-slug>/<subtab-slug>"`. Hard-code the four
  edge cases from §5.3.
- `nextjs-frontend/components/layout/notification-sidebar.tsx` —
  rewrite `handleGoToDetails` per §4.2.2.
- `nextjs-frontend/lib/grid-registry.tsx` — extend `register` so
  that on every registration, the registry checks
  `sessionStorage["pmt:next:pendingHighlight"]` and, if the
  pending entry matches, calls `jumpToRow` then clears the
  storage key.

**Test:**
- Pure-function jest test for `slugifyNotificationRoute` —
  cover all 11 modules and the special cases (`PnL`, `P&L`,
  `Recon`, `Portfolio Tools`).
- Mount-time pickup test: write to sessionStorage, mount a
  `<DataGrid gridId="pnl_change_grid" …>`, fire `onGridReady`,
  assert `jumpToRow` was called and the entry cleared.

**Commit message:** `feat(notifications): cross-page jump-to-row via sessionStorage handoff`

### 6.4 Commit D — sticky highlight via setInterval

**Files:**
- `nextjs-frontend/lib/grid-registry.tsx` — replace the three
  one-shot `setTimeout(apply, …)` calls with one `setInterval(apply,
  200)` that runs for 1.8 s, then a final cleanup pass.
- `nextjs-frontend/app/globals.css` — confirm the
  `.pmt-notification-highlight` rule exists (it does — was added in
  the 2026-05-07 session). Tweak the colour stops if needed to
  match Reflex's `.notification-highlight` (read its CSS).

**Test:**
- Update existing `__tests__/gridRegistry.test.tsx` to use fake
  timers, advance them, assert the highlight class is reapplied
  multiple times then cleared.

**Commit message:** `fix(grid-registry): re-apply sticky notification highlight every 200ms during scroll`

---

## 7. Reproduction setup (auth-bypass parity loop, unchanged)

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
`curl -I :3001/pmt/`) before any compare. Use `playwright-cli`
with two named sessions (`-s=nextjs`, `-s=reflex`) at 1440×900.

Before/after comparison hint — use a video, not a screenshot:

```bash
playwright-cli -s=reflex video-start
playwright-cli -s=reflex goto http://localhost:3001/pmt/market-data/market-data
sleep 8
playwright-cli -s=reflex video-stop docs/parity-screenshots/market-data/market-data-reflex-flash.webm

playwright-cli -s=nextjs video-start
playwright-cli -s=nextjs goto http://localhost:3000/dashboard/market-data/market-data
sleep 8
playwright-cli -s=nextjs video-stop docs/parity-screenshots/market-data/market-data-nextjs-flash.webm
```

Don't commit videos > 5 MB. Trim or downsample if needed.

---

## 8. Notification-jump manual test plan

Run after Commits C + D land. Both apps in three terminals as above.

1. **Same-page jump.** Open `:3000/dashboard/pnl/pnl-change`. Open
   the notification sidebar (bell icon). Click the "go to details"
   arrow on the `pnl-001` notification (`AAPL`). Expected: the
   `AAPL` row flashes yellow + sticky-highlights for ~1.8 s.
2. **Cross-page jump (cold).** Open `:3000/dashboard/market-data/market-data`.
   Click the same `pnl-001` notification. Expected: the URL changes
   to `/dashboard/pnl/pnl-change`, the page mounts, the grid loads,
   and the `AAPL` row flashes + highlights for ~1.8 s on arrival.
3. **Cross-page jump (warm).** Stay on the pnl-change page after #2.
   Click a different module's notification (e.g. `pos-001` →
   `positions/positions`). Same expected behaviour.
4. **Compare against `:3001/pmt/`** for each scenario — record
   `playwright-cli -s=… video-start` and play side-by-side.

If any scenario diverges, fix before moving on. Do not ship a partial
jump fix.

---

## 9. Verification matrix (run between commits, cite exact numbers)

```bash
# Frontend
cd /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend
pnpm exec tsc --noEmit
pnpm exec jest --runInBand
pnpm lint
pnpm build

# Desktop (only when src-tauri/ changes)
TAURI_BUILD=1 NEXT_PUBLIC_DESKTOP_TARGET=1 \
  NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 pnpm build

# Backend
cd ../fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

Expected steady-state at each commit:
- TSC: clean
- Jest: ≥ 50 (more after each commit's new test)
- Lint: 0 / 0
- Web build: PASS, 59 routes
- Backend pytest: 175 (or more if you went with option A)

Always cite numbers — never just "all green".

---

## 10. Exit criteria

Done when **all** are true:

1. `:3000/dashboard/market-data/market-data` shows cells flashing
   continuously when Auto Refresh is on, at the same cadence as
   `:3001/pmt/market-data` (eyeball + side-by-side video).
2. Clicking any notification on `:3000` navigates to the right
   page (if not already there) and flash-highlights the matching
   row for ~1.8 s.
3. Same-page, cross-page (cold), and cross-page (warm) scenarios
   in §8 all pass.
4. Verification matrix all green with cited numbers.
5. `git status` clean, fully pushed.
6. `continuations.md` has a 2026-05-XX entry summarising the four
   commits and the §10 walkthrough.
7. Two new videos under
   `docs/parity-screenshots/market-data/market-data-{reflex,nextjs}-flash.webm`
   (or screenshots if videos are too large) showing the flash
   parity.

---

## 11. Constraints (carry over)

- The Reflex app is the spec — read it before touching code.
- Don't break the web build path. `TAURI_BUILD=1` is the only flag
  that switches Next to static export.
- Don't hand-edit `app/openapi-client/`. Regenerate via
  `pnpm generate-client` against a running backend.
- Keep `pnpm-lock.yaml` as the only frontend lockfile.
- Auth pages stay client-rendered. No `'use server'` on actions.
- Dashboard pages must not server-render protected data.
- No new dependencies without justification. The work in §6 needs
  zero new deps.
- No comments that restate code. Only non-obvious WHY.
- Commit per defect fix.
- Push at least every 3 commits.

---

## 12. Recovery from interruption

Standard contract from §14 of the 2026-05-05 brief. After a crash:

1. `git status` is the truth — uncommitted is half-done (finish or
   stash).
2. `git log --oneline -10` shows what landed; cross-reference §6
   above.
3. Resume from the first unchecked commit in §6.
4. Run §9 verification matrix. If anything is red, fix before
   adding new work.

---

## 13. Resume prompt (paste into a fresh Codex agent)

```text
Resume work on /Users/orbot/Developer/work/Portfolio-Management-Tool, branch feat/nextjs-fastapi-rebuild.

Read these in order before doing anything:
1. docs/plans/handoff-prompt-2026-05-05.md — source of truth (convergence loop §5, per-page gate §5.3, exit criteria §11, verification matrix §12)
2. docs/plans/handoff-prompt-2026-05-06.md — auth-bypass workflow + OpenAPI baseURL bootstrap
3. docs/plans/handoff-prompt-2026-05-07-feature-parity.md — toolbar / status-bar / grid-runtime feature parity (closed)
4. docs/plans/handoff-prompt-2026-05-08-flash-and-jump.md — THIS BRIEF, the live-data feel + notification-jump pass
5. continuations.md — most recent entry first

Current state (2026-05-08, HEAD `e583fed`): 10 commits this session landed live-data feel defaults + filter-bar mop-up + 175-pytest restoration. Two parity defects remain:
  (a) Cells don't flash on :3000 the way they constantly flash on :3001/pmt/market-data — three stacked causes in §4.1.
  (b) Clicking a notification on :3000 doesn't navigate to the target page + jump to the row — diagnosed in §4.2.

Mission: close both. Methodology in §6 (4 commits, A→D). Surface §5 questions before committing.

Hard rules:
- Reflex at :3001 is the spec — read it, run it, screenshot it.
- No new state-management library. No new deps unless justified.
- Don't change the AG Grid flash duration unilaterally (it's 500 ms peak + 1000 ms fade by default on both sides).
- For per-page refresh cadence, use AskUserQuestion before dropping the wrapper default below 30 s.
- For the §4.1.2 jitter question, AskUserQuestion before picking option A vs B.
- Cite exact numbers (X passed, T seconds). Never just "all green".
- Commit per defect fix; push every 2-3 commits.
- Don't break already-converged pages — re-verify the 22 parity screenshots after.

Three-terminal setup with bypass flags ON (see §7). Use playwright-cli with two named sessions (-s=reflex, -s=nextjs) at 1440x900 viewport. For flash parity proof, use video-start / video-stop (not still screenshots — the flash isn't visible in a single frame).

Run §9 verification matrix between commits and report exact PASS/FAIL counts.

Exit criteria in §10 — both defects closed; manual test plan in §8 passes; verification matrix all green; continuations.md entry appended.
```

---

## 14. Useful one-liners

```bash
# Confirm Reflex's per-page auto-refresh interval
grep -rn "asyncio.sleep" /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex/app/states/ | grep auto_refresh -A 0 -B 1

# Confirm AG Grid flash duration defaults (both sides)
grep "cellFlashDuration\|cellFadeDuration" \
  /Users/orbot/Developer/work/Portfolio-Management-Tool/nextjs-frontend/node_modules/ag-grid-community/dist/types/src/gridOptionsDefault.d.ts

# Sample notifications shape (with grid_id, row_id, module, subtab)
curl -s http://127.0.0.1:8000/api/notifications/ | python3 -m json.tool | head -16

# Re-capture the 22 parity screenshots after Commits A-D land
# (script lives in docs/parity-screenshots/README.md §Reproduction)
```

---

End of 2026-05-08 flash-and-jump brief.
