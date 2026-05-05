from __future__ import annotations

import json
import os
import secrets
import sqlite3
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from alembic.script import ScriptDirectory
from sqlalchemy.engine import make_url


BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DESKTOP_APP_DIR_NAME = ".portfolio-management-tool"
DEFAULT_DESKTOP_DATABASE_FILENAME = "portfolio-management-tool.sqlite3"
DESKTOP_RUNTIME_FILENAME = "desktop-runtime.json"
DEFAULT_DESKTOP_CORS_ORIGINS = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:1420",
    "http://127.0.0.1:1420",
    "tauri://localhost",
    "http://tauri.localhost",
    "https://tauri.localhost",
)
SECRET_ENV_KEYS = (
    "ACCESS_SECRET_KEY",
    "RESET_PASSWORD_SECRET_KEY",
    "VERIFICATION_SECRET_KEY",
)
ASYNC_DRIVERS_BY_BACKEND = {
    "postgresql": "postgresql+asyncpg",
    "sqlite": "sqlite+aiosqlite",
}


@dataclass(frozen=True)
class DesktopRuntimeBootstrap:
    app_data_dir: Path
    database_url: str
    cors_origins: tuple[str, ...]


@dataclass(frozen=True)
class AlembicAssets:
    config_path: Path
    script_location: Path
    prepend_sys_path: tuple[Path, ...]


def parse_cors_origins(
    value: Any, *, default: Iterable[str] | None = None
) -> set[str]:
    default_values = {origin.strip() for origin in default or () if origin.strip()}

    if value is None:
        return default_values

    if isinstance(value, str):
        stripped_value = value.strip()
        if not stripped_value:
            return default_values

        if stripped_value.startswith("["):
            return parse_cors_origins(json.loads(stripped_value), default=default_values)

        return {
            origin.strip()
            for origin in stripped_value.split(",")
            if origin.strip()
        }

    if isinstance(value, (list, tuple, set, frozenset)):
        return {str(origin).strip() for origin in value if str(origin).strip()}

    raise TypeError(
        "CORS_ORIGINS must be provided as a JSON array, comma-separated string, or iterable.",
    )


def database_backend_from_url(database_url: str) -> str:
    return make_url(database_url).get_backend_name()


def is_sqlite_database_url(database_url: str) -> bool:
    return database_backend_from_url(database_url) == "sqlite"


def normalize_async_database_url(database_url: str) -> str:
    url = make_url(database_url)
    async_driver = ASYNC_DRIVERS_BY_BACKEND.get(url.get_backend_name())

    if async_driver is None:
        return database_url

    return url.set(drivername=async_driver).render_as_string(hide_password=False)


def build_sqlite_database_url(database_path: Path) -> str:
    resolved_path = database_path.resolve().as_posix()
    return f"sqlite+aiosqlite:///{resolved_path}"


def resolve_desktop_app_data_dir() -> Path:
    configured_dir = os.getenv("PMT_APP_DATA_DIR") or os.getenv(
        "PMT_DESKTOP_APP_DATA_DIR"
    )

    if configured_dir:
        return Path(configured_dir).expanduser()

    return Path.home() / DEFAULT_DESKTOP_APP_DIR_NAME


def resolve_runtime_root() -> Path:
    frozen_bundle_root = getattr(sys, "_MEIPASS", None)

    if getattr(sys, "frozen", False) and frozen_bundle_root:
        return Path(frozen_bundle_root)

    return BACKEND_ROOT


def resolve_alembic_assets() -> AlembicAssets:
    runtime_root = resolve_runtime_root()
    config_path = runtime_root / "alembic.ini"
    script_location = runtime_root / "alembic_migrations"
    prepend_sys_path: list[Path] = [runtime_root]

    if BACKEND_ROOT != runtime_root:
        prepend_sys_path.append(BACKEND_ROOT)

    return AlembicAssets(
        config_path=config_path,
        script_location=script_location,
        prepend_sys_path=tuple(prepend_sys_path),
    )


def ensure_desktop_sidecar_environment() -> DesktopRuntimeBootstrap:
    app_data_dir = resolve_desktop_app_data_dir().resolve()
    app_data_dir.mkdir(parents=True, exist_ok=True)
    _set_directory_permissions(app_data_dir)

    os.environ.setdefault("PMT_RUNTIME_MODE", "desktop")
    os.environ.setdefault("PMT_APP_DATA_DIR", str(app_data_dir))

    runtime_file = app_data_dir / DESKTOP_RUNTIME_FILENAME
    runtime_state = _load_runtime_state(runtime_file)
    runtime_state_updated = False

    for env_name in SECRET_ENV_KEYS:
        configured_value = os.getenv(env_name)
        if configured_value:
            continue

        stored_value = runtime_state.get(env_name)
        if not stored_value:
            stored_value = secrets.token_urlsafe(48)
            runtime_state[env_name] = stored_value
            runtime_state_updated = True

        os.environ[env_name] = stored_value

    if runtime_state_updated:
        _write_runtime_state(runtime_file, runtime_state)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        database_url = build_sqlite_database_url(
            app_data_dir / DEFAULT_DESKTOP_DATABASE_FILENAME
        )
        os.environ["DATABASE_URL"] = database_url

    cors_origins = parse_cors_origins(
        os.getenv("CORS_ORIGINS"), default=DEFAULT_DESKTOP_CORS_ORIGINS
    )
    if not os.getenv("CORS_ORIGINS"):
        os.environ["CORS_ORIGINS"] = json.dumps(sorted(cors_origins))

    return DesktopRuntimeBootstrap(
        app_data_dir=app_data_dir,
        database_url=database_url,
        cors_origins=tuple(sorted(cors_origins)),
    )


def run_migrations_to_head(database_url: str | None = None) -> None:
    from alembic import command
    from alembic.config import Config

    if database_url:
        os.environ["DATABASE_URL"] = database_url

    alembic_assets = resolve_alembic_assets()

    for path in alembic_assets.prepend_sys_path:
        path_str = str(path)
        if path_str not in sys.path:
            sys.path.insert(0, path_str)

    config = Config(str(alembic_assets.config_path))
    config.set_main_option("script_location", str(alembic_assets.script_location))
    config.set_main_option(
        "prepend_sys_path",
        os.pathsep.join(str(path) for path in alembic_assets.prepend_sys_path),
    )

    _stamp_legacy_sqlite_revision_if_needed(config, database_url)

    command.upgrade(config, "head")


def _stamp_legacy_sqlite_revision_if_needed(
    config: Any, database_url: str | None
) -> None:
    if not database_url or not is_sqlite_database_url(database_url):
        return

    sqlite_path = make_url(database_url).database
    if not sqlite_path:
        return

    connection = sqlite3.connect(sqlite_path)
    try:
        tables = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
        }
        alembic_revision = (
            connection.execute("SELECT version_num FROM alembic_version").fetchone()
            if "alembic_version" in tables
            else None
        )
    finally:
        connection.close()

    if alembic_revision:
        return

    legacy_revision = _legacy_sqlite_revision_for_tables(tables, config)
    if not legacy_revision:
        return

    connection = sqlite3.connect(sqlite_path)
    try:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL)"
        )
        connection.execute("DELETE FROM alembic_version")
        connection.execute(
            "INSERT INTO alembic_version(version_num) VALUES (?)",
            (legacy_revision,),
        )
        connection.commit()
    finally:
        connection.close()


def _legacy_sqlite_revision_for_tables(
    tables: set[str], config: Any
) -> str | None:
    if "user" not in tables:
        return None

    if "items" in tables:
        script_directory = ScriptDirectory.from_config(config)
        return script_directory.get_current_head()

    return "402d067a8b92"


def _load_runtime_state(runtime_file: Path) -> dict[str, str]:
    if not runtime_file.exists():
        return {}

    try:
        runtime_state = json.loads(runtime_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}

    if not isinstance(runtime_state, dict):
        return {}

    return {
        key: value
        for key, value in runtime_state.items()
        if isinstance(key, str) and isinstance(value, str)
    }


def _write_runtime_state(runtime_file: Path, runtime_state: dict[str, str]) -> None:
    runtime_file.parent.mkdir(parents=True, exist_ok=True)
    temp_file = runtime_file.with_suffix(".tmp")
    temp_file.write_text(
        json.dumps(runtime_state, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    try:
        os.chmod(temp_file, 0o600)
    except OSError:
        pass

    temp_file.replace(runtime_file)

    try:
        os.chmod(runtime_file, 0o600)
    except OSError:
        pass


def _set_directory_permissions(directory: Path) -> None:
    try:
        os.chmod(directory, 0o700)
    except OSError:
        pass
