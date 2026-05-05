from __future__ import annotations

import os
import sys
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def main() -> None:
    import uvicorn

    from app.runtime import ensure_desktop_sidecar_environment, run_migrations_to_head

    bootstrap = ensure_desktop_sidecar_environment()

    if not _env_flag("PMT_SKIP_MIGRATIONS"):
        run_migrations_to_head(bootstrap.database_url)

    from app.main import app as fastapi_app

    host = os.getenv("HOST") or os.getenv("PMT_HOST") or "127.0.0.1"
    port = int(os.getenv("PORT") or os.getenv("PMT_PORT") or "18475")
    log_level = os.getenv("LOG_LEVEL") or os.getenv("PMT_LOG_LEVEL") or "info"

    uvicorn.run(fastapi_app, host=host, port=port, log_level=log_level)


def _env_flag(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


if __name__ == "__main__":
    main()
