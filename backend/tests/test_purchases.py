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
                name="Supplier",
                phone="1234",
                email="s@s.com",
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
async def test_purchases_crud_and_activity_logs(app_client: AsyncClient, session_factory):
    token = await get_token(app_client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create
    payload = {
        "supplier_id": str(TEST_SUPPLIER_ID),
        "notes": "Test purchase",
        "items": [
            {
                "product_id": str(TEST_PRODUCT_ID),
                "quantity": 10,
                "cost_price": 5.0
            }
        ]
    }
    response = await app_client.post("/api/purchases", json=payload, headers=headers)
    assert response.status_code == 201
    purchase_id = response.json()["id"]
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.created" for log in logs)

    # List
    response = await app_client.get("/api/purchases", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    
    # Get
    response = await app_client.get(f"/api/purchases/{purchase_id}", headers=headers)
    assert response.status_code == 200
    
    # Update
    response = await app_client.patch(f"/api/purchases/{purchase_id}", json={"notes": "Updated"}, headers=headers)
    assert response.status_code == 200
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.updated" for log in logs)

    # Delete is admin only
    # Let's add an admin token and test it
    await app_client.post("/api/auth/signup", json={"email": "admin2@example.com", "password": "Password123!", "full_name": "Admin"})
    async with session_factory() as session:
        admin = (await session.execute(select(User).where(User.email == "admin2@example.com"))).scalar_one()
        admin.role = UserRole.ADMIN
        await session.commit()
    
    admin_token_resp = await app_client.post("/api/auth/login", json={"email": "admin2@example.com", "password": "Password123!"})
    admin_token = admin_token_resp.json()["access_token"]
    
    response = await app_client.delete(f"/api/purchases/{purchase_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.deleted" for log in logs)

