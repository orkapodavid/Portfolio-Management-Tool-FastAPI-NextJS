from typing import Any, AsyncGenerator

from fastapi import Depends
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import NullPool, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings
from .models import Base, User
from .runtime import (
    database_backend_from_url,
    is_sqlite_database_url,
    normalize_async_database_url,
)


ASYNC_DATABASE_URL = normalize_async_database_url(settings.DATABASE_URL)
DATABASE_BACKEND = database_backend_from_url(settings.DATABASE_URL)

engine_kwargs: dict[str, Any] = {}

if is_sqlite_database_url(ASYNC_DATABASE_URL):
    engine_kwargs["connect_args"] = {"timeout": 30}
else:
    # Disable connection pooling for serverless PostgreSQL environments like Vercel.
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(ASYNC_DATABASE_URL, **engine_kwargs)


if is_sqlite_database_url(ASYNC_DATABASE_URL):

    @event.listens_for(engine.sync_engine, "connect")
    def _configure_sqlite_connection(dbapi_connection: Any, _connection_record: Any) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.fetchone()
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

async_session_maker = async_sessionmaker(
    engine, expire_on_commit=settings.EXPIRE_ON_COMMIT
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
