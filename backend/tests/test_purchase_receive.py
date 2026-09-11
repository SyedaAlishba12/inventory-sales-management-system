"""
backend/tests/test_purchase_receive.py
---------------------------------------
Tests for purchase receive idempotency guard.
"""

import uuid
from collections.abc import AsyncIterator

import pytest
from fastapi import HTTPException
from sqlalchemy import Column, Table, Uuid, insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from database.base import Base
from database.session import create_database_engine, create_session_factory
from models.purchase import PaymentStatus, Purchase, PurchaseStatus
from services.purchase_service import purchase_service



TEST_USER_ID = uuid.uuid4()
TEST_SUPPLIER_ID = uuid.uuid4()


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
            Column("id", Uuid(as_uuid=True, native_uuid=True), primary_key=True),
        )

    suppliers_table = Base.metadata.tables.get("suppliers")
    if suppliers_table is None:
        suppliers_table = Table(
            "suppliers",
            Base.metadata,
            Column("id", Uuid(as_uuid=True, native_uuid=True), primary_key=True),
        )

    async with database_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        await connection.execute(
            insert(users_table).values(
                id=TEST_USER_ID,
                full_name="Test User",
                email="test@example.com",
                password_hash="hash",
                role="staff",
                is_active=True,
            )
        )
        await connection.execute(
            insert(suppliers_table).values(
                id=TEST_SUPPLIER_ID,
                name="Test Supplier",
                phone="1234567890",
                email="supplier@example.com",
            )
        )

    factory = create_session_factory(database_engine)
    try:
        yield factory
    finally:
        await database_engine.dispose()


async def test_receive_twice_is_rejected(
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    # 1. Create a pending purchase
    async with session_factory() as session:
        purchase = Purchase(
            supplier_id=TEST_SUPPLIER_ID,
            user_id=TEST_USER_ID,
            payment_status=PaymentStatus.PENDING,
            purchase_status=PurchaseStatus.PENDING,
            total_cost=100.0,
        )
        session.add(purchase)
        await session.commit()
        await session.refresh(purchase)
        purchase_id = purchase.id

    # 2. Receive the purchase (should succeed)
    async with session_factory() as session:
        received = await purchase_service.receive_purchase(session, purchase_id)
        assert received.purchase_status == PurchaseStatus.RECEIVED

    # 3. Receive the purchase again (should raise 409 Conflict)
    async with session_factory() as session:
        with pytest.raises(HTTPException) as exc_info:
            await purchase_service.receive_purchase(session, purchase_id)
        
        assert exc_info.value.status_code == 409
        assert "already been received" in exc_info.value.detail
