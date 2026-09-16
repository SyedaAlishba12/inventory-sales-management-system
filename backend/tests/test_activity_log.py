from collections.abc import AsyncIterator
from uuid import UUID, uuid4

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import Mapped, relationship

from common.config import Settings
from database.base import Base, UUIDPrimaryKeyMixin
from database.session import (
    create_database_engine,
    create_session_factory,
    get_db_session,
)

try:
    from models.user import User
except ModuleNotFoundError:

    class User(UUIDPrimaryKeyMixin, Base):
        """Test-only contract used until Taha's User model is merged."""

        __tablename__ = "users"

        activity_logs: Mapped[list["ActivityLog"]] = relationship(
            back_populates="user"
        )


from models.activity_log import ActivityLog  # noqa: E402
from routes.activity_log_routes import router  # noqa: E402
from schemas.activity_log import ActivityLogCreate  # noqa: E402
from services.activity_log_service import activity_log_service  # noqa: E402



TEST_USER_ID = uuid4()
PRODUCT_ID = uuid4()


@pytest.fixture
async def session_factory() -> AsyncIterator[async_sessionmaker[AsyncSession]]:
    settings = Settings(
        _env_file=None,
        app_env="testing",
        database_url="sqlite+aiosqlite:///:memory:",
    )
    database_engine = create_database_engine(settings)
    async with database_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        await connection.execute(
            insert(User).values(
                id=TEST_USER_ID,
                full_name="Test User",
                email="test@example.com",
                password_hash="hash",
                role="staff",
                is_active=True,
            )
        )

    factory = create_session_factory(database_engine)
    try:
        yield factory
    finally:
        await database_engine.dispose()


async def create_log(
    factory: async_sessionmaker[AsyncSession],
    *,
    action: str = "product.updated",
    entity_id: UUID = PRODUCT_ID,
) -> ActivityLog:
    async with factory() as session:
        activity_log = await activity_log_service.log(
            session,
            user_id=TEST_USER_ID,
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
        entity_id=PRODUCT_ID,
        description="  Updated stock level  ",
    )

    assert payload.action == "product.updated"
    assert payload.entity_type == "product"
    assert payload.description == "Updated stock level"


def test_activity_log_payload_requires_entity_type_for_entity_id() -> None:
    with pytest.raises(ValueError, match="entity_type is required"):
        ActivityLogCreate(action="product.updated", entity_id=PRODUCT_ID)


def test_activity_log_user_relationship_contract() -> None:
    assert ActivityLog.user.property.back_populates == "activity_logs"
    assert User.activity_logs.property.back_populates == "user"


async def test_service_creates_reads_filters_and_paginates_logs(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    first = await create_log(session_factory, entity_id=PRODUCT_ID)
    viewed_product_id = uuid4()
    await create_log(
        session_factory,
        action="product.viewed",
        entity_id=viewed_product_id,
    )

    async with session_factory() as session:
        stored = await activity_log_service.get_by_id(session, first.id)
        items, total, total_pages = await activity_log_service.list(
            session,
            page=1,
            page_size=1,
            action="product.updated",
            entity_type="product",
            entity_id=PRODUCT_ID,
            user_id=TEST_USER_ID,
        )

    assert stored is not None
    assert isinstance(first.id, UUID)
    assert first.user_id == TEST_USER_ID
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
        missing_response = await client.get(f"/api/activity-logs/{uuid4()}")
        invalid_range_response = await client.get(
            "/api/activity-logs",
            params={
                "start_date": "2026-09-08T12:00:00Z",
                "end_date": "2026-09-07T12:00:00Z",
            },
        )

    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1
    assert list_response.json()["items"][0]["id"] == str(activity_log.id)
    assert detail_response.status_code == 200
    assert detail_response.json()["action"] == "product.updated"
    assert missing_response.status_code == 404
    assert invalid_range_response.status_code == 422
