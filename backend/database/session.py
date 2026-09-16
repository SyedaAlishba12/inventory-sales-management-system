from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from common.config import Settings, get_settings


def create_database_engine(settings: Settings | None = None) -> AsyncEngine:
    resolved_settings = settings or get_settings()
    options: dict[str, Any] = {
        "echo": resolved_settings.database_echo,
        "pool_pre_ping": True,
    }
    if not resolved_settings.database_url.startswith("sqlite+"):
        options.update(
            pool_size=resolved_settings.database_pool_size,
            max_overflow=resolved_settings.database_max_overflow,
        )
    return create_async_engine(resolved_settings.database_url, **options)


def create_session_factory(
    database_engine: AsyncEngine,
) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=database_engine,
        class_=AsyncSession,
        autoflush=False,
        expire_on_commit=False,
    )


engine = create_database_engine()
SessionFactory = create_session_factory(engine)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency; callers explicitly commit successful writes."""

    async with SessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


@asynccontextmanager
async def session_scope(
    session_factory: async_sessionmaker[AsyncSession] = SessionFactory,
) -> AsyncIterator[AsyncSession]:
    """Transactional session for services, scripts, and background tasks."""

    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def check_database_connection(
    database_engine: AsyncEngine = engine,
) -> bool:
    async with database_engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
    return True


async def dispose_database(database_engine: AsyncEngine = engine) -> None:
    await database_engine.dispose()
