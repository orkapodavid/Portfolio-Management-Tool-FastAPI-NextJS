# Codex Team Prompt - Documentation, Setup Guide, And AGENTS Refresh

You are a Codex agent team picking up the Portfolio Management Tool
Next.js 16 + FastAPI + Tauri parity rebuild on branch
`feat/nextjs-fastapi-rebuild`.

Your task is to update the repository documentation for both human
developers and future coding agents. The repo has moved quickly
through the Reflex parity rebuild, and the docs must now reflect the
actual current system rather than older handoff assumptions.

## Start Here

Working directory:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool
```

Read first:

```text
docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md
continuations.md
docs/parity-screenshots/README.md
docs/parity-audit/2026-05-09/findings.md
docs/parity-audit/2026-05-09/route-matrix.md
```

Then inspect the current docs surface:

```bash
find . -maxdepth 3 -type f \( -iname '*readme*' -o -path './docs/*' \)
find . -name AGENTS.md -print
find . -maxdepth 3 -type f \( -name '*.env*' -o -name '*setup*' -o -name '*install*' \)
git status --short --branch
```

If repo-root `AGENTS.md` does not exist, create it. If it exists,
update it. Keep it concise, operational, and accurate.

## Required Outcomes

1. Human setup guide is current.
   It must explain how to run:
   - FastAPI backend with sqlite dev DB.
   - Next.js web app.
   - Tauri/desktop build/export path.
   - Reflex reference app for parity checks.
   - OpenAPI client regeneration.
   - Test/build verification commands.

2. Agent instructions are current.
   Create or update repo-root `AGENTS.md` with:
   - project layout,
   - build/test commands,
   - parity workflow,
   - OpenAPI regeneration rule,
   - auth-bypass safety rule,
   - storage namespace rule,
   - screenshot/parity artifact rules,
   - one-commit-per-defect discipline.

3. Documentation explains current parity status.
   It must mention:
   - Milestone B and C are closed through implementation HEAD
     `82142c9`; later docs-only prompt commits may exist.
   - F-7, F-21, F-23, F-35, and F-36 are closed.
   - F-9, F-27, F-28, and AG Grid license procurement remain
     out-of-scope intentional deltas unless reprioritized.
   - Next.js read-only column supersets are intentional where
     documented.

4. Env examples and setup docs are safe.
   Auth-bypass flags may be documented for local parity work, but must
   default OFF in committed examples.

5. Docs are useful to humans.
   Avoid copying the old handoff prompts wholesale. Consolidate them
   into a clear setup/readme flow with commands, expected ports, and
   troubleshooting notes.

## Commands And Facts To Preserve

Backend dev server:

```bash
cd fastapi_backend
DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pmt-dev.sqlite3 \
  PMT_AUTH_DISABLED=true \
  ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Next.js dev server:

```bash
cd nextjs-frontend
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev
```

Reflex reference:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool-reflex
uv run reflex run
```

OpenAPI regeneration:

```bash
cd nextjs-frontend
pnpm generate-client
```

Frontend verification:

```bash
cd nextjs-frontend
pnpm exec tsc --noEmit --pretty false
pnpm exec jest --runInBand
pnpm lint
pnpm build
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Backend verification:

```bash
cd fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

Last known verification:

- TSC clean.
- Jest: 28 suites / 157 tests passed in 1.857 s.
- Lint: 0 errors / 0 warnings.
- Web build: 59 / 59 static pages generated.
- Backend pytest: 187 passed, 2 skipped in 9.42 s.
- Desktop static export: 59 / 59 static pages generated.

## Suggested Team Split

- Agent 1: inventory and update human README/setup docs.
- Agent 2: create/update `AGENTS.md` and agent-facing operating
  rules.
- Agent 3: reconcile parity docs (`docs/parity-screenshots`,
  `continuations.md`, plan index) with current state.
- Agent 4: verify commands by running targeted docs checks and links.

Do not let multiple agents edit the same file at the same time. Assign
file ownership explicitly before writing.

## Acceptance Criteria

- `AGENTS.md` exists at repo root and is accurate.
- Human setup docs clearly cover backend, frontend, desktop, Reflex,
  OpenAPI generation, auth bypass, screenshots, and tests.
- Historical handoff prompts remain available but are no longer the
  only way to understand the project state.
- No committed env example enables auth bypass by default.
- Markdown is concise and navigable.
- Run at minimum:

```bash
git diff --check
rg -n "PMT_AUTH_DISABLED=true|NEXT_PUBLIC_AUTH_DISABLED=1" . --glob '*.env*'
```

- If code or command examples are changed materially, run the relevant
  verification command and cite exact results in `continuations.md`.
- Commit documentation changes in coherent commits and push the branch.
