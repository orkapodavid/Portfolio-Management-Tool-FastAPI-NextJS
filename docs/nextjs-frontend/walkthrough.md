# Next.js Frontend Walkthrough

The frontend in `nextjs-frontend/` is a Next.js 16 App Router
application using React 19, TypeScript, Tailwind CSS, AG Grid
Enterprise, Jest, and the Tauri v2 desktop shell.

## Runtime Shape

```text
nextjs-frontend/
├── app/
│   ├── dashboard/            # PMT module pages and shared dashboard layout
│   └── openapi-client/       # Generated client; do not edit by hand
├── components/
│   ├── grid/                 # AG Grid wrapper, columns, filter bars
│   ├── layout/               # top nav, subtabs, notification sidebar
│   └── auth/                 # dashboard auth gate
├── lib/                      # config, route constants, auth, registry helpers
├── __tests__/                # Jest tests
└── src-tauri/                # Tauri shell and FastAPI sidecar scripts
```

The dashboard routes are driven by `lib/constants.ts`. Reflex remains
the parity spec at `http://localhost:3001/pmt/` unless
`docs/parity-screenshots/README.md` documents an intentional delta.

## Key Areas

| Area | Files |
|---|---|
| Module routes | `app/dashboard/<module>/<subtab>/page.tsx` |
| Dashboard shell | `app/dashboard/layout.tsx`, `components/layout/*` |
| Data grid runtime | `components/grid/data-grid.tsx` |
| Column helpers | `components/grid/columns.ts` |
| Filter bars | `components/grid/filter-bar.tsx` and page-specific peers |
| Notification jump registry | `lib/grid-registry.tsx`, `lib/notification-routes.ts` |
| Generated API client | `app/openapi-client/*` |
| Desktop shell | `src-tauri/*` |

## OpenAPI Client

The frontend talks to FastAPI through the generated client under
`app/openapi-client/`. Regenerate it from a running backend:

```bash
cd nextjs-frontend
pnpm generate-client
```

The generator fetches the live backend schema, writes
`nextjs-frontend/openapi.json`, then runs `openapi-ts` with
`openapi-ts.config.ts`. Do not hand-edit generated files.

## Auth

Normal web development uses the FastAPI auth endpoints and token
helpers in `lib/auth/`. Local parity work can skip login by starting
the frontend with:

```bash
NEXT_PUBLIC_AUTH_DISABLED=1 pnpm dev
```

Pair it with `PMT_AUTH_DISABLED=true` on the backend. The committed
frontend example keeps `NEXT_PUBLIC_AUTH_DISABLED=0`.

## Desktop Target

Tauri sets desktop build env through `src-tauri/scripts/run-next-with-tauri-env.mjs`.
For a direct static export check:

```bash
cd nextjs-frontend
TAURI_BUILD=1 \
NEXT_PUBLIC_DESKTOP_TARGET=1 \
NEXT_PUBLIC_DESKTOP_API_BASE_URL=http://127.0.0.1:18475 \
pnpm build
```

Tauri commands:

```bash
pnpm tauri:sidecar
pnpm tauri:dev
pnpm tauri:build
```

## Storage Keys

Browser storage keys must stay under the `pmt:next:` namespace. Current
examples include:

- `pmt:next:notificationSidebarOpen`
- `pmt:next:pendingHighlight`
- `pmt:next:<grid_id>_state`

Do not add raw, unprefixed storage keys.

## Verification

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

Last known gate-close results are recorded in `continuations.md` and
the root `README.md`.
