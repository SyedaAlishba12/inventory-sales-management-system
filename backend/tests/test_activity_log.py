from collections.abc import AsyncIterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Column, Integer, Table, insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from database.base import Base
from database.session import (
    create_database_engine,
    create_session_factory,
    get_db_session,
)
from models.activity_log import ActivityLog
from routes.activity_log_routes import router
from schemas.activity_log import ActivityLogCreate
from services.activity_log_service import activity_log_service


@pytest.fixture
async def session_factory() -> AsyncIterator[async_sessionmaker[AsyncSession]]:
    settings = Settings(
        _env_file=None,
        app_env="testing",
        database_url="sqlite+aiosqlite:///:memory:",
    )
    database_engine = create_database_engine(settings)
    users_table = Base.metadata.tables.get("users")
    if users_table is None:
        users_table = Table(
            "users",
            Base.metadata,
            Column("id", Integer, primary_key=True),
        )

    async with database_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        await connection.execute(insert(users_table).values(id=1))

    factory = create_session_factory(database_engine)
    try:
        yield factory
    finally:
        await database_engine.dispose()


async def create_log(
    factory: async_sessionmaker[AsyncSession],
    *,
    action: str = "product.updated",
    entity_id: int = 42,
) -> ActivityLog:
    async with factory() as session:
        activity_log = await activity_log_service.log(
            session,
            user_id=1,
            action=action,
            entity_type="product",
            entity_id=entity_id,
            description="  Updated stock level  ",
        )
        await session.commit()
        return activity_log


def test_activity_log_payload_normalizes_text() -> None:
    payload = ActivityLogCreate(
        action="  product.updated  ",
        entity_type="  product ",
        entity_id=42,
        description="  Updated stock level  ",
    )

    assert payload.action == "product.updated"
    assert payload.entity_type == "product"
    assert payload.description == "Updated stock level"


def test_activity_log_payload_requires_entity_type_for_entity_id() -> None:
    with pytest.raises(ValueError, match="entity_type is required"):
        ActivityLogCreate(action="product.updated", entity_id=42)


async def test_service_creates_reads_filters_and_paginates_logs(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    first = await create_log(session_factory, entity_id=42)
    await create_log(session_factory, action="product.viewed", entity_id=99)

    async with session_factory() as session:
        stored = await activity_log_service.get_by_id(session, first.id)
        items, total, total_pages = await activity_log_service.list(
            session,
            page=1,
            page_size=1,
            action="product.updated",
            entity_type="product",
            entity_id=42,
            user_id=1,
        )

    assert stored is not None
    assert stored.description == "Updated stock level"
    assert [item.id for item in items] == [first.id]
    assert total == 1
    assert total_pages == 1


async def test_activity_log_read_api_and_errors(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    activity_log = await create_log(session_factory)
    test_app = FastAPI()
    test_app.include_router(router)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    test_app.dependency_overrides[get_db_session] = override_session
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_response = await client.get(
            "/api/activity-logs",
            params={"action": "product.updated", "page_size": 10},
        )
        detail_response = await client.get(
            f"/api/activity-logs/{activity_log.id}"
        )
        missing_response = await client.get("/api/activity-logs/999")
        invalid_range_response = await client.get(
            "/api/activity-logs",
            params={
                "start_date": "2026-09-08T12:00:00Z",
                "end_date": "2026-09-07T12:00:00Z",
            },
        )

    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1
    assert list_response.json()["items"][0]["id"] == activity_log.id
    assert detail_response.status_code == 200
    assert detail_response.json()["action"] == "product.updated"
    assert missing_response.status_code == 404
    assert invalid_range_response.status_code == 422
