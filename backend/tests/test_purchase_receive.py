"""
backend/tests/test_purchase_receive.py
---------------------------------------
Tests for purchase receive and stock-in wiring.
"""

import uuid
from collections.abc import AsyncIterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Column, Table, Uuid, insert, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from database.base import Base
from database.session import create_database_engine, create_session_factory, get_db_session
from models.user import UserRole, User
from models.supplier import Supplier
from models.product import Product
from models.category import Category
from models.inventory import Inventory
from models.purchase import PaymentStatus, Purchase, PurchaseStatus
from models.activity_log import ActivityLog
from routes.purchase_routes import router as purchase_router
from routes.auth_routes import router as auth_router


TEST_USER_ID = uuid.uuid4()
TEST_SUPPLIER_ID = uuid.uuid4()
TEST_CATEGORY_ID = uuid.uuid4()
TEST_PRODUCT_ID = uuid.uuid4()


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
        from common.security import hash_password
        
        await connection.execute(
            insert(User).values(
                id=TEST_USER_ID,
                full_name="Staff User",
                email="staff@example.com",
                password_hash=hash_password("Password123!"),
                role=UserRole.STAFF,
                is_active=True,
            )
        )
        await connection.execute(
            insert(Supplier).values(
                id=TEST_SUPPLIER_ID,
                name="Test Supplier",
                phone="1234567890",
                email="supplier@example.com",
            )
        )
        await connection.execute(
            insert(Category).values(
                id=TEST_CATEGORY_ID,
                name="Category",
            )
        )
        await connection.execute(
            insert(Product).values(
                id=TEST_PRODUCT_ID,
                category_id=TEST_CATEGORY_ID,
                name="Product",
                sku="PROD-1",
                selling_price=10.0,
                cost_price=5.0,
                min_stock_level=0,
            )
        )
        await connection.execute(
            insert(Inventory).values(
                id=uuid.uuid4(),
                product_id=TEST_PRODUCT_ID,
                current_stock=20,
                opening_stock=20,
                damaged_stock=0,
            )
        )

    factory = create_session_factory(database_engine)
    try:
        yield factory
    finally:
        await database_engine.dispose()


@pytest.fixture
def app_client(session_factory: async_sessionmaker[AsyncSession]) -> AsyncClient:
    test_app = FastAPI()
    test_app.include_router(purchase_router)
    test_app.include_router(auth_router)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    test_app.dependency_overrides[get_db_session] = override_session
    transport = ASGITransport(app=test_app)
    return AsyncClient(transport=transport, base_url="http://test")


async def get_token(client):
    resp = await client.post("/api/auth/login", json={"email": "staff@example.com", "password": "Password123!"})
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_purchase_receive_flow(
    app_client: AsyncClient,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    token = await get_token(app_client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a purchase with items
    payload = {
        "supplier_id": str(TEST_SUPPLIER_ID),
        "notes": "Test receive purchase",
        "items": [
            {
                "product_id": str(TEST_PRODUCT_ID),
                "quantity": 15,
                "cost_price": 5.0
            }
        ]
    }
    create_response = await app_client.post("/api/purchases", json=payload, headers=headers)
    assert create_response.status_code == 201
    purchase_id = create_response.json()["id"]

    # 2. Receive the purchase (should succeed)
    receive_response = await app_client.patch(f"/api/purchases/{purchase_id}/receive", headers=headers)
    assert receive_response.status_code == 200
    assert receive_response.json()["purchase_status"] == "RECEIVED"

    # 3. Assert Inventory.current_stock increased (20 + 15 = 35)
    async with session_factory() as session:
        inventory = (await session.execute(
            select(Inventory).where(Inventory.product_id == TEST_PRODUCT_ID)
        )).scalars().first()
        assert inventory is not None
        assert inventory.current_stock == 35

    # 4. Assert Activity Log was created for "purchase.received"
    async with session_factory() as session:
        logs = (await session.execute(
            select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id))
        )).scalars().all()
        assert any(log.action == "purchase.received" for log in logs)

    # 5. Receive the purchase again (should raise 409 Conflict)
    receive_twice_response = await app_client.patch(f"/api/purchases/{purchase_id}/receive", headers=headers)
    assert receive_twice_response.status_code == 409
    assert "already been received" in receive_twice_response.json()["detail"]
