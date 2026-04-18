# Recommendation for Extending `nextjs-fastapi-template` to Web, Desktop, and Mobile with Tauri

## Executive summary

The **best low-risk path** is to **keep your existing Python/FastAPI backend**, keep **Next.js** as the UI layer, and add **Tauri v2** as a thin native shell for **desktop first**, while treating **mobile as a second deployment target that should usually call a remote FastAPI API instead of embedding Python locally**. This conclusion follows from three facts. First, Tauri v2 officially supports **desktop and mobile platforms** and can work with essentially any frontend that compiles to HTML, JavaScript, and CSS.[1] [2] Second, the official Next.js guidance for Tauri requires **static export** rather than SSR, so your Tauri-facing frontend should be treated as a static client shell, not as a server-rendered Next app.[3] Third, Tauri v2 officially supports bundling **external binaries** and explicitly names **Python executables and API servers** as a common sidecar use case, which makes preserving your FastAPI backend a supported pattern rather than a workaround.[4]

The most relevant starter template for your coding LLM is therefore **`dieharders/example-tauri-v2-python-server-sidecar`**, because it already demonstrates the exact combination you care about: **Next.js + FastAPI + Tauri v2 + Python sidecar packaging**.[5] As a secondary reference, I would pair it with **`kvnxiao/tauri-nextjs-template`**, which is a cleaner and more actively maintained reference for the frontend shell, Next.js static export, App Router details, and Tauri 2 project hygiene.[6]

## The architecture I recommend

The easiest architecture is not a single identical runtime across web, desktop, and mobile. Instead, the most maintainable structure is a **shared product architecture** with **different runtime packaging per platform**.

| Platform | UI layer | App shell | Backend strategy | Recommendation |
|---|---|---|---|---|
| Web | Next.js | Browser | Existing FastAPI service | Keep your current template as the web baseline |
| Desktop | Next.js in static-export mode | Tauri v2 | FastAPI packaged as a local Python sidecar, or remote FastAPI if preferred | Best target for adding Tauri first |
| Mobile | Next.js static client in Tauri mobile webview | Tauri v2 mobile | Prefer remote FastAPI API; avoid embedded Python unless you have a very strong reason | Use after desktop is stable |

This is the right split because **Tauri is a native shell**, while **Next.js remains your shared UI technology**, and **FastAPI remains your business/backend layer**. The web version continues to use the traditional browser-plus-server model. The desktop version can bundle Python locally because Tauri sidecars are explicitly supported.[4] The mobile version is different: although Tauri v2 supports Android and iOS, the practical "easy" path is not to carry a local Python runtime onto mobile, but instead to keep mobile thin and talk to your existing FastAPI backend over HTTPS.[1] [2]

## Should you rewrite Python in Rust?

My recommendation is **no full rewrite**. A full backend rewrite from Python to Rust would create major migration cost without solving your main cross-platform problem. Your real challenge is **platform packaging and runtime boundaries**, not backend language choice.

A selective Rust approach is better.

| Layer | Keep in Python? | Move to Rust? | Why |
|---|---|---|---|
| Existing business logic, API routes, validation, admin workflows | Yes | No | You already have working code and Tauri supports Python sidecars[4] [5] |
| Desktop-native integrations, local filesystem bridges, tray/menu, secure OS hooks | No | Yes, if needed | These are where Tauri and Rust are strongest[1] [2] |
| Mobile-native integrations | Usually no Python | Yes, thin native layer only if needed | Mobile-specific platform hooks fit Tauri’s native model better[1] |
| Performance-critical local routines | Maybe | Sometimes | Rewrite only bottlenecks, not the entire backend |

In practice, **Rust should be your host/runtime glue**, not your immediate replacement for FastAPI.

## The key constraint: Next.js in Tauri is not a normal SSR deployment

The most important technical limitation is that **Tauri does not support a server-based Next.js frontend inside the app shell**. The official Next.js guide says to use **`output: 'export'`** and the generated **`out`** directory as the frontend distribution.[3] Community templates reinforce the same point and warn about SSR assumptions in development and production.[6] [7]

That means your coding LLM should treat the Tauri-facing app as a **static client application**. If your current `nextjs-fastapi-template` uses Next.js API routes, SSR-only rendering, or server actions for critical behavior, those concerns should be moved to **FastAPI** or refactored into pure client-side flows for the Tauri targets.

## Best template choice for your situation

### 1. Primary template: `dieharders/example-tauri-v2-python-server-sidecar`

This is the best match because it directly demonstrates the architecture you want: **Next.js frontend, FastAPI backend, Tauri v2 wrapper, Python sidecar packaging**.[5] It is the closest thing to a migration blueprint from your existing stack.

> "This example app uses Next.js as the frontend and Python (FastAPI) as the backend." — `dieharders/example-tauri-v2-python-server-sidecar` README[5]

> "This template project is intended to demonstrate the use of single file Python executables with Tauri v2." — `dieharders/example-tauri-v2-python-server-sidecar` README[5]

Use this repository as the **primary implementation reference** for your coding LLM.

### 2. Secondary template: `kvnxiao/tauri-nextjs-template`

This is the best **frontend-shell reference**. It is strong for project structure, tooling, App Router usage, static export configuration, and maintenance quality.[6] It is especially helpful if your coding LLM needs a cleaner Tauri 2 + Next.js baseline after it understands the Python sidecar pattern.

It also contains a useful warning:

> "Next.js is typically overkill for the frontend of a Tauri application." — `kvnxiao/tauri-nextjs-template` README[6]

I agree with that statement in general, but in **your** case it is still reasonable to keep Next.js because you already have a substantial codebase and want to preserve investment rather than restart with a lighter SPA stack.

### 3. Tertiary reference: `0xle0ne/nextauri`

This is still a usable reference for Next.js plus Tauri basics, but it is less aligned with your direction because its README frames the project primarily around **desktop** and says mobile is a future plan rather than a core current focus.[7] I would use it only as an extra example, not as your main base.

## What I would actually ask the coding LLM to build

I would not ask it to "convert my app to Tauri everywhere" in one shot. I would ask it to perform the work in **three stages**.

| Stage | Goal | Why this order is best |
|---|---|---|
| Stage 1 | Add Tauri v2 desktop shell around your existing Next.js frontend and package FastAPI as a sidecar | This gives the highest value with the least architectural distortion |
| Stage 2 | Refactor any Next.js SSR-dependent flows so the Tauri version uses static export cleanly | This resolves the main Tauri compatibility issue[3] |
| Stage 3 | Add Tauri mobile wrapper that reuses the frontend but calls remote FastAPI instead of local Python | This avoids the hardest packaging/runtime issues on mobile |

That sequence lets you get a working desktop app quickly while keeping the path open for mobile later.

## Concrete recommendation

If you want the shortest path with the highest chance of success, I recommend the following:

| Decision area | Recommendation |
|---|---|
| Keep Python or rewrite in Rust? | **Keep Python** for backend logic; do not rewrite wholesale |
| Tauri version | **Tauri v2** only |
| Frontend in Tauri | **Next.js static export** only |
| Desktop backend model | **Python FastAPI sidecar** packaged per target |
| Mobile backend model | **Remote FastAPI API**, not embedded Python |
| Best base template | **`dieharders/example-tauri-v2-python-server-sidecar`** |
| Best secondary polishing reference | **`kvnxiao/tauri-nextjs-template`** |

## Ready-to-send prompt for your coding LLM

Below is the prompt I would give your coding LLM.

> I have an existing codebase based on `vintasoftware/nextjs-fastapi-template`. I want you to extend it into a cross-platform architecture with **web + desktop + mobile** using **Tauri v2** while preserving as much of my existing Python backend as possible.
>
> Use these references as guidance:
>
> 1. Primary reference: `https://github.com/dieharders/example-tauri-v2-python-server-sidecar`
> 2. Secondary reference: `https://github.com/kvnxiao/tauri-nextjs-template`
>
> Requirements:
>
> - Keep **FastAPI/Python** as the main backend and business logic layer.
> - Keep **Next.js** as the UI technology.
> - Add **Tauri v2** for desktop first.
> - Configure the Tauri-facing Next.js app for **static export** only.
> - Move any SSR-dependent logic that blocks static export into **FastAPI** or client-side code.
> - For desktop, package the Python backend as a **Tauri sidecar** executable.
> - For mobile, do **not** embed Python initially; instead, prepare the app to call the existing FastAPI backend remotely.
> - Keep Rust minimal and use it only for the Tauri host layer and any required native integrations.
> - Produce a **monorepo-friendly structure** so web, desktop, and mobile share as much frontend code as practical.
> - Add clear build scripts and documentation for:
>   - web development and deployment,
>   - Tauri desktop development and packaging,
>   - future Tauri mobile setup.
>
> Deliverables:
>
> 1. A proposed folder structure.
> 2. A migration plan from my current template.
> 3. The exact config changes needed for Next.js static export in the Tauri target.
> 4. The Tauri configuration for launching the Python sidecar.
> 5. Build scripts for development and production.
> 6. Notes on what parts of my current Next.js app must change if they rely on SSR or server-only features.
>
> Optimize for **minimal rewrite, maximum reuse, and production realism**.

## Final verdict

Your best path is **not** "rewrite everything in Rust." Your best path is to keep the architecture you already understand and gradually layer Tauri on top of it. For **desktop**, Tauri + Next.js static export + Python FastAPI sidecar is the strongest fit and has direct template support.[3] [4] [5] For **mobile**, keep the same UI strategy but use your existing FastAPI service remotely instead of trying to force Python into the app package from day one.[1] [2]

If you want a single sentence recommendation: **start from `dieharders/example-tauri-v2-python-server-sidecar`, borrow frontend structure ideas from `kvnxiao/tauri-nextjs-template`, keep Python, and only use Rust as a thin Tauri-native layer.**

## References

[1]: https://v2.tauri.app/ "Tauri 2.0 | Tauri"
[2]: https://v2.tauri.app/start/ "What is Tauri? | Tauri"
[3]: https://v2.tauri.app/start/frontend/nextjs/ "Next.js | Tauri"
[4]: https://v2.tauri.app/develop/sidecar/ "Embedding External Binaries | Tauri"
[5]: https://github.com/dieharders/example-tauri-v2-python-server-sidecar "dieharders/example-tauri-v2-python-server-sidecar"
[6]: https://github.com/kvnxiao/tauri-nextjs-template "kvnxiao/tauri-nextjs-template"
[7]: https://github.com/0xle0ne/nextauri "0xle0ne/nextauri"
