import uuid
from collections.abc import AsyncIterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from database.base import Base
from database.session import create_database_engine, create_session_factory, get_db_session
from middleware.auth_middleware import require_admin, require_staff
from routes.supplier_routes import router


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

    factory = create_session_factory(database_engine)
    try:
        yield factory
    finally:
        await database_engine.dispose()


@pytest.fixture
def app_client(session_factory: async_sessionmaker[AsyncSession]) -> AsyncClient:
    test_app = FastAPI()
    test_app.include_router(router)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    class MockUser:
        def __init__(self, id, role):
            self.id = id
            self.role = role

    async def override_staff():
        return MockUser(id=uuid.uuid4(), role="STAFF")
        
    async def override_admin():
        return MockUser(id=uuid.uuid4(), role="ADMIN")

    test_app.dependency_overrides[get_db_session] = override_session
    test_app.dependency_overrides[require_staff] = override_staff
    test_app.dependency_overrides[require_admin] = override_admin
    transport = ASGITransport(app=test_app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_create_supplier(app_client: AsyncClient) -> None:
    payload = {
        "name": "Supplier Inc",
        "email": "contact@supplier.com",
        "phone": "+1-800-555-0200",
        "address": "456 Supplier St"
    }
    response = await app_client.post("/api/suppliers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Supplier Inc"


@pytest.mark.asyncio
async def test_create_duplicate_phone_rejected(app_client: AsyncClient) -> None:
    payload = {
        "name": "First Supplier",
        "email": "first@supplier.com",
        "phone": "555-8888",
    }
    await app_client.post("/api/suppliers", json=payload)
    
    payload_duplicate = {
        "name": "Second Supplier",
        "email": "second@supplier.com",
        "phone": "555-8888",
    }
    response = await app_client.post("/api/suppliers", json=payload_duplicate)
    assert response.status_code == 409
    assert "A supplier with this phone number already exists." in response.text


@pytest.mark.asyncio
async def test_update_supplier(app_client: AsyncClient) -> None:
    payload = {
        "name": "Update Supplier",
        "phone": "555-9999",
    }
    create_resp = await app_client.post("/api/suppliers", json=payload)
    supplier_id = create_resp.json()["id"]

    update_payload = {
        "email": "updated@supplier.com"
    }
    update_resp = await app_client.patch(f"/api/suppliers/{supplier_id}", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["email"] == "updated@supplier.com"


@pytest.mark.asyncio
async def test_delete_supplier(app_client: AsyncClient) -> None:
    payload = {
        "name": "Delete Supplier",
        "phone": "555-7777",
    }
    create_resp = await app_client.post("/api/suppliers", json=payload)
    supplier_id = create_resp.json()["id"]

    delete_resp = await app_client.delete(f"/api/suppliers/{supplier_id}")
    assert delete_resp.status_code == 204

    get_resp = await app_client.get(f"/api/suppliers/{supplier_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_suppliers(app_client: AsyncClient) -> None:
    payload1 = {"name": "List Supplier A", "phone": "555-6661"}
    payload2 = {"name": "List Supplier B", "phone": "555-6662"}
    await app_client.post("/api/suppliers", json=payload1)
    await app_client.post("/api/suppliers", json=payload2)

    list_resp = await app_client.get("/api/suppliers")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert len(data) >= 2
    names = [s["name"] for s in data]
    assert "List Supplier A" in names
    assert "List Supplier B" in names
