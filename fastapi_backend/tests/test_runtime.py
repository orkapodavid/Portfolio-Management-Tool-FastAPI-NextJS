from __future__ import annotations

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.models import Base
from app.runtime import BACKEND_ROOT, run_migrations_to_head


def build_alembic_config() -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "alembic_migrations"))
    config.set_main_option("prepend_sys_path", str(BACKEND_ROOT))
    return config


def test_run_migrations_to_head_upgrades_existing_sqlite_schema(
    tmp_path,
    monkeypatch,
):
    database_path = tmp_path / "desktop-upgrade.sqlite3"
    async_database_url = f"sqlite+aiosqlite:///{database_path}"
    sync_database_url = f"sqlite:///{database_path}"

    monkeypatch.setenv("DATABASE_URL", async_database_url)

    alembic_config = build_alembic_config()
    command.upgrade(alembic_config, "402d067a8b92")

    engine = create_engine(sync_database_url)
    with engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            == "402d067a8b92"
        )
        assert "items" not in inspect(connection).get_table_names()
    engine.dispose()

    run_migrations_to_head(async_database_url)

    engine = create_engine(sync_database_url)
    with engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            == "b389592974f8"
        )
        assert "items" in inspect(connection).get_table_names()
    engine.dispose()


def test_run_migrations_to_head_stamps_legacy_sqlite_schema_without_alembic_version(
    tmp_path,
    monkeypatch,
):
    database_path = tmp_path / "legacy-desktop.sqlite3"
    async_database_url = f"sqlite+aiosqlite:///{database_path}"
    sync_database_url = f"sqlite:///{database_path}"

    engine = create_engine(sync_database_url)
    Base.metadata.create_all(engine)
    engine.dispose()

    monkeypatch.setenv("DATABASE_URL", async_database_url)

    run_migrations_to_head(async_database_url)

    engine = create_engine(sync_database_url)
    with engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            == "b389592974f8"
        )
        assert {"user", "items"}.issubset(set(inspect(connection).get_table_names()))
    engine.dispose()


def test_run_migrations_to_head_stamps_legacy_sqlite_schema_with_empty_alembic_version(
    tmp_path,
    monkeypatch,
):
    database_path = tmp_path / "legacy-empty-version.sqlite3"
    async_database_url = f"sqlite+aiosqlite:///{database_path}"
    sync_database_url = f"sqlite:///{database_path}"

    engine = create_engine(sync_database_url)
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(
            text("CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)")
        )
    engine.dispose()

    monkeypatch.setenv("DATABASE_URL", async_database_url)

    run_migrations_to_head(async_database_url)

    engine = create_engine(sync_database_url)
    with engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            == "b389592974f8"
        )
        assert {"user", "items"}.issubset(set(inspect(connection).get_table_names()))
    engine.dispose()
