import uuid
from collections.abc import AsyncIterator
from uuid import uuid4
import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from common.security import hash_password, create_access_token
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


async def get_staff_token(client) -> str:
    """Login as the pre-seeded STAFF user."""
    resp = await client.post("/api/auth/login", json={"email": "staff@example.com", "password": "Password123!"})
    return resp.json()["access_token"]


async def get_admin_token(session_factory) -> str:
    """Create an ADMIN user directly in the DB and mint a token.
    
    Cannot go through public signup — that endpoint hardcodes STAFF by design.
    """
    async with session_factory() as session:
        admin = User(
            id=uuid4(),
            full_name="Test Admin",
            email=f"admin-{uuid4()}@example.com",
            password_hash=hash_password("Str0ng!Pass"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
    return create_access_token(str(admin.id), admin.role.value)


@pytest.mark.asyncio
async def test_purchases_crud_and_activity_logs(app_client: AsyncClient, session_factory):
    admin_token = await get_admin_token(session_factory)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Confirm staff token is correctly denied on admin-only create
    staff_token = await get_staff_token(app_client)
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    staff_denied = await app_client.post("/api/purchases", json={
        "supplier_id": str(TEST_SUPPLIER_ID),
        "notes": "should be denied",
        "items": [{"product_id": str(TEST_PRODUCT_ID), "quantity": 1, "cost_price": 5.0}]
    }, headers=staff_headers)
    assert staff_denied.status_code == 403, "Staff must be denied access to purchase creation (RBAC check)"

    # Create (admin)
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
    response = await app_client.post("/api/purchases", json=payload, headers=admin_headers)
    assert response.status_code == 201
    purchase_id = response.json()["id"]
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.created" for log in logs)

    # List (admin)
    response = await app_client.get("/api/purchases", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1
    
    # Get (admin)
    response = await app_client.get(f"/api/purchases/{purchase_id}", headers=admin_headers)
    assert response.status_code == 200
    
    # Update (admin)
    response = await app_client.patch(f"/api/purchases/{purchase_id}", json={"notes": "Updated"}, headers=admin_headers)
    assert response.status_code == 200
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.updated" for log in logs)

    # Delete (admin)
    response = await app_client.delete(f"/api/purchases/{purchase_id}", headers=admin_headers)
    assert response.status_code == 204
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(purchase_id)))).scalars().all()
        assert any(log.action == "purchase.deleted" for log in logs)
