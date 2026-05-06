# Codex Team Prompt - Remove Vercel Deployment Surface

You are a Codex agent team taking over the Portfolio Management Tool
Next.js 16 + FastAPI + Tauri rebuild on branch
`feat/nextjs-fastapi-rebuild`.

The project will not deploy on Vercel. Your task is to remove Vercel
deployment code, config, workflows, secrets, and active documentation
from the repository, then leave clear docs for the supported local,
self-hosted, and desktop paths.

Do not remove Next.js itself. The goal is to remove Vercel as a
deployment target, not to rewrite the frontend stack.

## Start Here

Working directory:

```bash
cd /Users/orbot/Developer/work/Portfolio-Management-Tool
```

Read first:

```text
AGENTS.md
docs/plans/current-parity-rebuild-compact-plan-2026-05-11.md
docs/plans/PLANS_INDEX.md
continuations.md
docs/deployment.md
docs/get-started.md
```

Then inventory the current Vercel surface:

```bash
git status --short --branch
rg -n "vercel|@vercel|VERCEL|Vercel" . \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!dist/**' \
  --glob '!out/**' \
  --glob '!ag-grid-demo/frontend/tsconfig.tsbuildinfo'
find . -maxdepth 4 \( -iname '*vercel*' -o -name 'vercel.json' \) -print
```

If the worktree is dirty, do not revert unrelated changes. Either work
around them or coordinate file ownership before editing.

## Known Targets At Prompt Creation

At prompt creation, the active Vercel deployment surface included:

```text
prod-backend-deploy.yml
prod-frontend-deploy.yml
fastapi_backend/vercel.json
fastapi_backend/vercel.prod.json
nextjs-frontend/vercel.json
```

Search also found references that must be reviewed:

```text
docs/deployment.md
docs/fastapi_backend/backend-architecture.md
fastapi_backend/app/database.py
continuations.md
skills-lock.json
skills/next-best-practices/metadata.md
skills/next-best-practices/self-hosting.md
```

The `skills/` and `skills-lock.json` matches may be local skill metadata
or general Next.js reference material rather than product deployment
code. Review them deliberately; do not delete unrelated local tooling
just because it mentions Vercel. If any match remains, explain why it is
not part of the product deployment surface.

## Required Outcomes

1. Remove active Vercel deployment config.
   Delete Vercel JSON files and Vercel-only deployment workflows unless
   you replace them with non-Vercel equivalents in the same commit.

2. Remove Vercel secrets and environment requirements.
   No active setup, CI, or deploy path should require:
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `VERCEL_PROJECT_ID_BACKEND`
   - `VERCEL_PROJECT_ID_FRONTEND`
   - `VERCEL_TOKEN`

3. Update deployment documentation.
   `docs/deployment.md` and any linked setup docs must state that Vercel
   deployment is not supported for this repo. Replace old Vercel
   instructions with the supported targets:
   - local FastAPI backend,
   - local Next.js web app,
   - Tauri desktop build/static export,
   - future self-hosted deployment to be designed separately.

4. Keep docs navigation accurate.
   If `mkdocs.yml` links to deployment docs, make sure the linked page
   is still useful and does not describe removed Vercel workflows as
   current.

5. Update backend architecture wording.
   If code comments or docs mention Vercel only as an example of
   serverless pooling constraints, either generalize the wording or
   remove it. Preserve any real database behavior unless the code is
   exclusively for Vercel.

6. Preserve parity rebuild rules.
   Do not hand-edit `nextjs-frontend/app/openapi-client/`.
   Do not change auth-bypass defaults in committed env examples.
   Keep browser storage keys under `pmt:next:`.

## Suggested Team Split

- Agent 1: remove Vercel config files and deployment workflows.
- Agent 2: update deployment, setup, mkdocs, and continuation docs.
- Agent 3: inspect frontend/backend package files and comments for
  Vercel-specific dependencies, scripts, env names, or runtime branches.
- Agent 4: run verification and residual-reference audit.

Assign file ownership before edits. Do not let multiple agents stage
files concurrently.

## Implementation Guidance

- Prefer deletion over archiving for Vercel-only config.
- If a deployment workflow is Vercel-only, remove it rather than leaving
  a disabled workflow that still documents Vercel secrets.
- If a package dependency or script exists only to support Vercel CLI,
  remove it and refresh the lockfile with the package manager used by
  that package.
- If a reference is historical but useful, move it into a concise note
  such as "Vercel deployment was removed and is unsupported" rather than
  retaining old instructions.
- Do not remove generic self-hosting guidance merely because it compares
  with Vercel.
- Do not remove `next/og`, Next.js cache APIs, or other Next.js features
  just because their ecosystem is associated with Vercel.

## Verification

Run the residual search after edits:

```bash
rg -n "vercel|@vercel|VERCEL|Vercel" . \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!dist/**' \
  --glob '!out/**' \
  --glob '!ag-grid-demo/frontend/tsconfig.tsbuildinfo'
find . -maxdepth 4 \( -iname '*vercel*' -o -name 'vercel.json' \) -print
```

The search should return zero active deployment/config references. If
any references remain, list each one in `continuations.md` with a short
justification.

Run baseline checks:

```bash
git diff --check
```

If frontend config, package files, scripts, or deployment docs with
frontend commands changed, run:

```bash
cd nextjs-frontend
pnpm exec tsc --noEmit --pretty false
pnpm build
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

If backend code, dependencies, or runtime config changed, run:

```bash
cd fastapi_backend
TEST_DATABASE_URL=sqlite+aiosqlite:///$(pwd)/.pytest-sqlite.sqlite3 \
  ./.venv/bin/python -m pytest -q
```

If mkdocs tooling is available, run:

```bash
mkdocs build
```

Record exact counts and timings. Do not summarize results as only
"green".

## Commit Plan

Keep commits coherent and easy to review:

1. Remove Vercel config, workflows, scripts, and dependency references.
2. Update deployment/setup/architecture docs.
3. Update `continuations.md` with the removal summary, residual-search
   result, and exact verification.

Push after the work is complete. Final status must be clean except for
pre-existing unrelated files that were explicitly left untouched.

## Acceptance Criteria

- `fastapi_backend/vercel.json`,
  `fastapi_backend/vercel.prod.json`, and
  `nextjs-frontend/vercel.json` are removed unless there is a written
  non-Vercel justification.
- Vercel-only production deployment workflows are removed.
- No current setup, deploy, CI, package, or env documentation asks for
  Vercel CLI or `VERCEL_*` secrets.
- Deployment docs describe the supported non-Vercel paths.
- Residual Vercel references are either gone or explicitly justified as
  non-product skill/reference metadata.
- Verification results and exact residual-search status are recorded in
  `continuations.md`.
- Branch is pushed and the final `git status --short --branch` is
  clean except for known unrelated pre-existing edits.
