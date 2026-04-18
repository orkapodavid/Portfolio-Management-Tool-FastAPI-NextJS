# Tauri v2 Implementation Plan: Web, Desktop & Mobile

Based on the recommendation document and analysis of the current Portfolio Management Tool codebase.

---

## 1. Proposed Folder Structure

```
Portfolio-Management-Tool/
├── fastapi_backend/                  # UNCHANGED - Python/FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── users.py
│   │   ├── database.py
│   │   ├── email.py
│   │   ├── utils.py
│   │   ├── email_templates/
│   │   └── routes/
│   ├── alembic_migrations/
│   ├── tests/
│   ├── commands/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── watcher.py
│   └── start.sh
│
├── pmt_core_pkg/                     # UNCHANGED - Shared Python business logic
│   └── pmt_core/
│
├── nextjs-frontend/                  # SHARED UI source (dual-mode)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── clientService.ts
│   │   ├── openapi-client/           # Auto-generated API client
│   │   ├── dashboard/                # Dashboard pages
│   │   ├── login/
│   │   ├── register/
│   │   └── password-recovery/
│   ├── components/
│   │   ├── actions/                  # REFACTORED: server actions → client actions
│   │   └── layout/
│   ├── lib/
│   │   ├── clientConfig.ts           # REFACTORED: dual-mode config
│   │   ├── definitions.ts
│   │   ├── utils.ts
│   │   └── auth-context.tsx          # NEW: client-side auth context
│   ├── public/
│   ├── next.config.mjs               # REFACTORED: dual build modes
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json                   # UPDATED: add tauri scripts
│   └── pnpm-lock.yaml
│
├── src-tauri/                        # NEW - Tauri v2 native shell
│   ├── Cargo.toml                    # Rust dependencies
│   ├── build.rs                      # Tauri build script
│   ├── tauri.conf.json               # Tauri configuration
│   ├── capabilities/                 # Tauri v2 capability permissions
│   │   └── default.json
│   ├── icons/                        # App icons for all platforms
│   ├── src/
│   │   ├── main.rs                   # App entry, sidecar lifecycle
│   │   └── lib.rs                    # Tauri commands (Rust→JS bridge)
│   └── sidecar/                      # Staging for packaged Python binary
│       └── .gitkeep
│
├── scripts/                          # NEW - Build & dev orchestration
│   ├── build-sidecar.sh              # Build Python sidecar with PyInstaller
│   ├── dev-desktop.sh                # Start Tauri dev (desktop)
│   ├── dev-web.sh                    # Start web dev (current flow)
│   └── setup-mobile.sh              # Future: mobile prerequisites
│
├── docs/
│   └── plans/
│       ├── Recommendation for Extending  to Web, Desktop, and Mobile with Tauri.md
│       └── tauri-implementation-plan.md   # This file
│
├── docker-compose.yml                # UNCHANGED - web/Docker workflow
├── Makefile                          # UPDATED: add tauri targets
└── .gitignore                        # UPDATED: add Tauri artifacts
```

### Key structural decisions

| Decision | Rationale |
|---|---|
| `src-tauri/` lives at repo root, not inside `nextjs-frontend/` | Tauri CLI expects `src-tauri` relative to the frontend dist. Placing it at root simplifies monorepo management and matches both reference templates |
| `fastapi_backend/` and `pmt_core_pkg/` are untouched | No changes to backend code. Python sidecar packaging is a build-time concern only |
| `scripts/` is separate from `Makefile` | Shell scripts give more flexibility for complex build pipelines (PyInstaller, platform detection). Makefile calls them |
| `nextjs-frontend/` stays as single source of truth | Same codebase produces web build (SSR) and Tauri build (static export) via config switches |

---

## 2. Migration Plan (3 Stages)

### Stage 1: Add Tauri v2 Desktop Shell

**Goal**: Get a working desktop app that wraps the existing Next.js frontend and launches FastAPI as a local sidecar.

**Steps**:

1. **Initialize Tauri v2 in the repo**
   ```bash
   pnpm add -D @tauri-apps/cli@^2
   pnpm tauri init
   ```
   - When prompted: set `frontendDist` to `../nextjs-frontend/out`
   - Set `beforeDevCommand` to `pnpm --dir nextjs-frontend dev`
   - Set `beforeBuildCommand` to `pnpm --dir nextjs-frontend build:tauri`
   - Set app identifier to `com.pmt.desktop`

2. **Configure Next.js for dual-mode builds**
   - Add `output: 'export'` and `images: { unoptimized: true }` to `next.config.mjs` behind a `TAURI_BUILD` env flag
   - See Section 3 for exact config changes

3. **Set up Python sidecar packaging**
   - Install PyInstaller in `fastapi_backend/`
   - Create a PyInstaller spec file that bundles `app/`, `pmt_core/`, and dependencies
   - Configure Tauri `externalBin` in `tauri.conf.json`
   - See Section 4 for exact Tauri config

4. **Implement sidecar lifecycle in Rust**
   - Launch FastAPI sidecar on app start
   - Wait for health check (poll `localhost:8000/api/health`)
   - Graceful shutdown on app close
   - See Section 4 for Rust code

5. **Add Tauri dev/build scripts**
   - Add `dev:tauri`, `build:tauri`, `build:sidecar` scripts to `package.json`
   - Add Makefile targets: `make tauri-dev`, `make tauri-build`
   - See Section 5 for exact scripts

6. **Test desktop app**
   - `make tauri-dev` should open a native window with the dashboard
   - FastAPI should start automatically
   - Login, navigation, and data loading should work

### Stage 2: Refactor SSR-Dependent Flows for Static Export

**Goal**: Make the Tauri-facing frontend work fully as a static export (no server-side rendering, no server actions, no cookies from Next.js headers).

**Steps**:

1. **Refactor server actions to client actions**
   - Move all `"use server"` functions to client-side equivalents
   - Replace `cookies()` token access with client-side storage (localStorage or Tauri store plugin)
   - See Section 6 for detailed refactoring notes per file

2. **Refactor the market-data page** (`app/dashboard/market-data/market-data/page.tsx`)
   - This page is an `async` server component that calls `cookies()` directly
   - Convert to a `"use client"` component with `useEffect` for data fetching

3. **Create client-side auth context**
   - New `lib/auth-context.tsx` using React context
   - Manages access token in localStorage (web) or Tauri Store (desktop)
   - Provides `getToken()`, `setToken()`, `clearToken()` functions
   - Wraps the app in a provider that handles auth state

4. **Replace `revalidatePath` calls**
   - `revalidatePath("/dashboard")` in `items-action.ts` does not work in static export
   - Replace with client-side state invalidation (React Query or SWR, or simple `router.refresh()`)

5. **Handle `redirect()` from server actions**
   - Server action `redirect()` calls don't work in static export
   - Replace with `router.push()` in client components

6. **Verify static export works**
   ```bash
   TAURI_BUILD=1 pnpm --dir nextjs-frontend build
   ```
   - Confirm `nextjs-frontend/out/` is generated without errors
   - Confirm all pages render correctly when served statically

### Stage 3: Add Tauri Mobile Wrapper (Future)

**Goal**: Reuse the static frontend in Tauri mobile builds, calling remote FastAPI instead of local sidecar.

**Steps** (not implemented now, documented for future):

1. Install mobile prerequisites (Android Studio / Xcode)
2. Initialize mobile targets:
   ```bash
   pnpm tauri android init
   pnpm tauri ios init
   ```
3. Create a runtime config that detects platform:
   - Desktop → connect to `localhost:8000` (sidecar)
   - Mobile → connect to remote FastAPI URL from env/config
4. Skip sidecar for mobile builds (no `externalBin` in mobile config)
5. Handle mobile-specific UI concerns (touch, viewport, navigation patterns)
6. Test on Android emulator and iOS simulator

---

## 3. Next.js Static Export Configuration Changes

### Current `next.config.mjs`

```javascript
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          async: true,
          typescript: {
            configOverwrite: {
              compilerOptions: {
                skipLibCheck: true,
              },
            },
          },
        })
      );
    }
    return config;
  },
};

export default nextConfig;
```

### Proposed `next.config.mjs` (dual-mode)

```javascript
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isTauriBuild = process.env.TAURI_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isTauriBuild && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          async: true,
          typescript: {
            configOverwrite: {
              compilerOptions: {
                skipLibCheck: true,
              },
            },
          },
        })
      );
    }
    return config;
  },
};

export default nextConfig;
```

### What changes and why

| Config | Web mode | Tauri mode | Why |
|---|---|---|---|
| `output` | (default, SSR) | `'export'` | Tauri cannot run a Node server; it needs static files |
| `images.unoptimized` | (default) | `true` | Next.js image optimization requires a server; static export cannot use it |
| `distDir` | `.next` | `out` | `output: 'export'` automatically outputs to `out/` |

### Additional changes needed in `nextjs-frontend/`

1. **`app/layout.tsx`** — Remove `export const metadata` (not supported in static export). Use `<title>` and `<meta>` tags directly in the HTML `<head>` via `<Head>` component or `next/head` for the Tauri build.

2. **`tailwind.config.js`** — No changes needed.

3. **`tsconfig.json`** — No changes needed.

4. **`.env.local`** — Ensure `API_BASE_URL` is set appropriately per environment:
   - Web dev: `http://localhost:8000`
   - Tauri dev: `http://localhost:8000` (sidecar)
   - Tauri prod: `http://localhost:8000` (sidecar)
   - Mobile: remote URL (e.g., `https://api.pmt.example.com`)

---

## 4. Tauri Configuration for Python Sidecar

### `src-tauri/tauri.conf.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/nicegui-nicegui/nicegui/refs/heads/main/tauri/tauri.conf.schema.json",
  "productName": "Portfolio Management Tool",
  "version": "0.1.0",
  "identifier": "com.pmt.desktop",
  "build": {
    "beforeDevCommand": "pnpm --dir nextjs-frontend dev",
    "beforeBuildCommand": "TAURI_BUILD=1 pnpm --dir nextjs-frontend build",
    "frontendDist": "../nextjs-frontend/out",
    "devUrl": "http://localhost:3000"
  },
  "app": {
    "windows": [
      {
        "title": "Portfolio Management Tool",
        "width": 1280,
        "height": 800,
        "minWidth": 960,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "externalBin": [
      "binaries/pmt-backend"
    ]
  }
}
```

### Sidecar naming convention

Tauri requires sidecar binaries to follow a specific naming pattern that includes the target triple:

```
src-tauri/binaries/
├── pmt-backend-x86_64-pc-windows-msvc.exe    # Windows x64
├── pmt-backend-x86_64-apple-darwin            # macOS Intel
├── pmt-backend-aarch64-apple-darwin           # macOS Apple Silicon
└── pmt-backend-x86_64-unknown-linux-gnu       # Linux x64
```

The `externalBin` value `"binaries/pmt-backend"` tells Tauri to look for `pmt-backend-{target-triple}` at runtime.

### `src-tauri/Cargo.toml`

```toml
[package]
name = "pmt-desktop"
version = "0.1.0"
description = "Portfolio Management Tool - Desktop"
authors = ["PMT Team"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["devtools"] }
tauri-plugin-shell = "2"
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
command-group = "2"
tokio = { version = "1", features = ["full"] }

[features]
custom-protocol = ["tauri/custom-protocol"]
```

### `src-tauri/src/main.rs` — Sidecar lifecycle management

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;
use std::sync::Mutex;

struct Backend(Mutex<Option<CommandChild>>);

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(Backend(Mutex::new(None)))
        .setup(|app| {
            // Launch the FastAPI sidecar
            let (rx, child) = app.shell()
                .sidecar("pmt-backend")
                .expect("failed to create sidecar command")
                .spawn()
                .expect("failed to spawn sidecar");

            // Store the child process for graceful shutdown
            let backend = app.state::<Backend>();
            *backend.0.lock().unwrap() = Some(child);

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Gracefully kill the sidecar when the window closes
                let backend = window.state::<Backend>();
                if let Ok(mut guard) = backend.0.lock() {
                    if let Some(ref mut child) = *guard {
                        let _ = child.kill();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### `src-tauri/capabilities/default.json` — Permissions

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capability for PMT Desktop",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-spawn",
    "shell:allow-kill",
    "shell:allow-execute",
    "store:default"
  ]
}
```

---

## 5. Build Scripts for Development and Production

### `nextjs-frontend/package.json` — Updated scripts

Add these scripts to the existing `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "build:tauri": "TAURI_BUILD=1 next build --webpack",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "generate-client": "node ./generate-client.js",
    "test": "jest",
    "coverage": "jest --coverage",
    "prettier": "prettier --write '**/*.{js,jsx,ts,tsx,json,css,html}'",
    "tsc": "tsc",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2"
  }
}
```

### `scripts/build-sidecar.sh` — Python sidecar packaging

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/fastapi_backend"
OUTPUT_DIR="$PROJECT_ROOT/src-tauri/binaries"

echo "Building Python sidecar with PyInstaller..."

cd "$BACKEND_DIR"

# Determine the target triple from environment or default to current platform
TARGET_TRIPLE="${TARGET_TRIPLE:-}"

# Build the PyInstaller spec
uv run pyinstaller \
  --name "pmt-backend${TARGET_TRIPLE:+-$TARGET_TRIPLE}" \
  --onedir \
  --add-data "app:app" \
  --add-data "$PROJECT_ROOT/pmt_core_pkg:pmt_core_pkg" \
  --hidden-import=uvicorn.logging \
  --hidden-import=uvicorn.loops \
  --hidden-import=uvicorn.loops.auto \
  --hidden-import=uvicorn.protocols \
  --hidden-import=uvicorn.protocols.http \
  --hidden-import=uvicorn.protocols.http.auto \
  --hidden-import=uvicorn.protocols.websockets \
  --hidden-import=uvicorn.protocols.websockets.auto \
  --hidden-import=uvicorn.lifespan \
  --hidden-import=uvicorn.lifespan.on \
  --hidden-import=app.routes \
  --hidden-import=app.models \
  --hidden-import=app.users \
  --hidden-import=pmt_core \
  app/main.py \
  --distpath "$OUTPUT_DIR" \
  --workpath "$BACKEND_DIR/.pyinstaller-work" \
  --specpath "$BACKEND_DIR"

echo "Sidecar built to $OUTPUT_DIR/"
```

### `scripts/dev-desktop.sh` — Desktop development

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting Tauri desktop development mode..."

# Ensure sidecar exists (build if needed)
if [ ! -d "$PROJECT_ROOT/src-tauri/binaries" ] || [ -z "$(ls -A $PROJECT_ROOT/src-tauri/binaries 2>/dev/null)" ]; then
  echo "Sidecar not found. Building..."
  bash "$SCRIPT_DIR/build-sidecar.sh"
fi

cd "$PROJECT_ROOT/nextjs-frontend"
pnpm tauri dev
```

### `scripts/dev-web.sh` — Web development (current workflow)

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting web development mode..."
echo "Make sure FastAPI backend is running separately (make start-backend)"

cd "$PROJECT_ROOT/nextjs-frontend"
pnpm dev
```

### Updated `Makefile` additions

Append these targets to the existing Makefile:

```makefile
# Tauri Desktop commands
.PHONY: tauri-dev tauri-build build-sidecar

build-sidecar: ## Build Python sidecar binary with PyInstaller
	bash scripts/build-sidecar.sh

tauri-dev: ## Start Tauri desktop development mode
	bash scripts/dev-desktop.sh

tauri-build: ## Build Tauri desktop app for production
	cd $(FRONTEND_DIR) && pnpm tauri build

# Mobile (future)
.PHONY: tauri-android-dev tauri-ios-dev

tauri-android-dev: ## Start Tauri Android development (future)
	cd $(FRONTEND_DIR) && pnpm tauri android dev

tauri-ios-dev: ## Start Tauri iOS development (future)
	cd $(FRONTEND_DIR) && pnpm tauri ios dev
```

### `.gitignore` additions

```
# Tauri
src-tauri/target/
src-tauri/binaries/
src-tauri/WixTools/
fastapi_backend/.pyinstaller-work/
fastapi_backend/build/
*.spec
```

---

## 6. SSR / Server Actions Refactoring Notes

This is the most critical and labor-intensive stage. The following files use Next.js server-side features that are **incompatible with `output: 'export'`**.

### 6.1 Server Actions that use `cookies()` from `next/headers`

| File | Server feature used | What it does | Refactoring approach |
|---|---|---|---|
| `components/actions/login-action.ts` | `"use server"`, `cookies()` | Validates login, sets `accessToken` cookie | Convert to `"use client"` function. Store token in localStorage or Tauri Store. Use `router.push()` instead of returning `redirectTo` |
| `components/actions/logout-action.ts` | `"use server"`, `cookies()`, `redirect()` | Reads token from cookies, calls logout API, deletes cookie, redirects | Convert to client function. Read token from localStorage/Tauri Store. Use `router.push("/login")` |
| `components/actions/items-action.ts` | `"use server"`, `cookies()`, `revalidatePath()` | CRUD operations on items, uses cookie for auth | Convert to client functions. Replace `revalidatePath` with client-side cache invalidation. Use `router.refresh()` or React Query mutation |
| `components/actions/register-action.ts` | `"use server"` | Registration (no cookies, but still a server action) | Convert to `"use client"` function. Call API directly from client |
| `components/actions/password-reset-action.ts` | `"use server"` | Password reset flow (no cookies, but still a server action) | Convert to `"use client"` function. Call API directly from client |

### 6.2 Server Components that use `cookies()`

| File | Server feature used | What it does | Refactoring approach |
|---|---|---|---|
| `app/dashboard/market-data/market-data/page.tsx` | `cookies()`, `redirect()`, `async` server component | Loads market data server-side with auth token from cookies | Convert to `"use client"` component. Fetch data in `useEffect` or React Query. Handle auth redirect client-side |

### 6.3 Root Layout metadata export

| File | Server feature used | Refactoring approach |
|---|---|---|
| `app/layout.tsx` | `export const metadata` | `metadata` export is not supported in static export. Replace with `<head>` tags or use `next/head` for the Tauri build. Can conditionally export based on `TAURI_BUILD` env var |

### 6.4 Proposed auth refactoring strategy

**Current flow**: Token stored in HTTP-only cookie via server action → `cookies()` reads it → passed as `Authorization` header to API calls.

**New flow for Tauri**: Token stored in localStorage (web) or Tauri Store plugin (desktop) → client-side context reads it → passed as `Authorization` header to API calls.

**Implementation**:

1. Create `lib/auth-context.tsx`:
   ```tsx
   "use client";
   import { createContext, useContext, useState, useEffect, useCallback } from "react";

   type AuthContextType = {
     token: string | null;
     setToken: (token: string | null) => void;
     clearToken: () => void;
     isAuthenticated: boolean;
   };

   const AuthContext = createContext<AuthContextType | null>(null);

   export function AuthProvider({ children }: { children: React.ReactNode }) {
     const [token, setTokenState] = useState<string | null>(null);

     useEffect(() => {
       // Load token from storage on mount
       const stored = localStorage.getItem("accessToken");
       if (stored) setTokenState(stored);
     }, []);

     const setToken = useCallback((newToken: string | null) => {
       setTokenState(newToken);
       if (newToken) {
         localStorage.setItem("accessToken", newToken);
       } else {
         localStorage.removeItem("accessToken");
       }
     }, []);

     const clearToken = useCallback(() => setToken(null), [setToken]);

     return (
       <AuthContext.Provider value={{
         token,
         setToken,
         clearToken,
         isAuthenticated: !!token,
       }}>
         {children}
       </AuthContext.Provider>
     );
   }

   export function useAuth() {
     const ctx = useContext(AuthContext);
     if (!ctx) throw new Error("useAuth must be used within AuthProvider");
     return ctx;
   }
   ```

2. Update `lib/clientConfig.ts` to integrate with auth context:
   ```ts
   import { client } from "@/app/openapi-client/client.gen";

   const configureClient = () => {
     const baseURL = typeof window !== "undefined"
       ? (process.env.API_BASE_URL || "http://localhost:8000")
       : process.env.API_BASE_URL;

     client.setConfig({ baseURL });

     // Add request interceptor for auth token
     client.interceptors.request.use((config) => {
       const token = localStorage.getItem("accessToken");
       if (token) {
         config.headers = config.headers || {};
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     });
   };

   configureClient();
   ```

3. Refactor each server action to a client-side hook/function that:
   - Reads token from `useAuth()` context
   - Calls the API client directly
   - Handles errors and redirects client-side

### 6.5 Dual-mode compatibility strategy

The key question: **should the web version also abandon server actions?**

Two approaches:

| Approach | Pros | Cons |
|---|---|---|
| **A: Dual mode** — web keeps server actions, Tauri uses client actions | Web retains SSR benefits (HTTP-only cookies, SEO, initial load) | Two code paths to maintain, more complexity |
| **B: Unified client mode** — both web and Tauri use client actions | Single codebase, less maintenance, simpler auth model | Lose SSR benefits for web; cookies become client-accessible |

**Recommendation**: Start with **Approach B (unified client mode)** for the Tauri implementation stage. This avoids maintaining two parallel auth systems and is simpler. If the web deployment later needs SSR/SEO benefits, server actions can be re-added as an enhancement. The current app is behind a login wall (dashboard), so SEO is not a concern.

---

## 7. Dependency Checklist

### New npm dependencies (in `nextjs-frontend/`)

| Package | Purpose |
|---|---|
| `@tauri-apps/cli` (dev) | Tauri build and dev commands |
| `@tauri-apps/api` | Tauri JS API (window, event, etc.) |
| `@tauri-apps/plugin-store` | Tauri persistent key-value store |

### New Python dependencies (in `fastapi_backend/`)

| Package | Purpose |
|---|---|
| `pyinstaller` (dev) | Package FastAPI as standalone executable |

### New Rust dependencies (in `src-tauri/`)

| Crate | Purpose |
|---|---|
| `tauri` v2 | Core Tauri framework |
| `tauri-plugin-shell` v2 | Sidecar process management |
| `tauri-plugin-store` v2 | Persistent storage |
| `command-group` | Process group management for sidecar |
| `tokio` | Async runtime |
| `serde` / `serde_json` | Serialization |

### System prerequisites

| Tool | Purpose |
|---|---|
| Rust toolchain (`rustup`) | Compile Tauri native shell |
| Platform SDKs | macOS: Xcode CLI tools; Windows: Visual Studio Build Tools; Linux: `libwebkit2gtk-4.1-dev` etc. |
| PyInstaller | Package Python backend as sidecar |

---

## 8. Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PyInstaller fails to bundle all Python dependencies | Medium | High | Test sidecar build early in Stage 1. Use `--hidden-import` and `--collect-data` flags. Consider `--onedir` mode over `--onefile` for easier debugging |
| Static export breaks existing pages | Medium | Medium | Test `TAURI_BUILD=1 pnpm build` early. Start with the dual-mode config to identify issues progressively |
| `next/font/local` incompatible with static export | Low | Low | Already compatible; `localFont` works with `output: 'export'` |
| Sidecar startup race condition (frontend loads before API is ready) | Medium | Medium | Add health check polling in the frontend before making API calls. Show loading state until backend responds |
| Large app binary size (Python + Node + Rust) | High | Low | Use `--onedir` mode. Compress with UPX. Accept ~100-200MB total as reasonable for a desktop app |
| `window` / `navigator` undefined during SSR in Tauri mode | Low | Low | All dashboard pages already have `"use client"`. Only the layout needs attention |

---

## 9. Implementation Order (Recommended Sequence)

1. Install Rust toolchain and verify `pnpm tauri init` works
2. Add dual-mode `next.config.mjs` and verify `TAURI_BUILD=1 pnpm build` produces `out/`
3. Create `src-tauri/` with `tauri.conf.json`, `Cargo.toml`, and `main.rs`
4. Test Tauri dev mode with a minimal "hello world" — confirm the webview loads `localhost:3000`
5. Set up PyInstaller spec and build sidecar
6. Configure `externalBin` in `tauri.conf.json` and test sidecar launch
7. Verify desktop app shows the dashboard and can fetch data from the sidecar
8. Refactor server actions to client actions (one at a time, testing after each)
9. Create `auth-context.tsx` and integrate into the app
10. Test full auth flow (login → dashboard → logout) in desktop app
11. Test `tauri build` and verify the production installer works
12. Document mobile setup steps for future Stage 3
