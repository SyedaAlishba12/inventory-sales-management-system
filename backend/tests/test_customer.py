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
from routes.customer_routes import router


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


from middleware.auth_middleware import require_admin, require_staff

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
async def test_create_customer(app_client: AsyncClient) -> None:
    payload = {
        "name": "Acme Corp",
        "email": "contact@acmecorp.com",
        "phone": "+1-800-555-0100",
        "address": "123 Main St"
    }
    response = await app_client.post("/api/customers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corp"


@pytest.mark.asyncio
async def test_create_duplicate_phone_rejected(app_client: AsyncClient) -> None:
    payload = {
        "name": "First Corp",
        "email": "first@example.com",
        "phone": "555-0000",
        "address": "123 Main St"
    }
    await app_client.post("/api/customers", json=payload)
    
    payload_duplicate = {
        "name": "Second Corp",
        "email": "second@example.com",
        "phone": "555-0000",
        "address": "456 Main St"
    }
    response = await app_client.post("/api/customers", json=payload_duplicate)
    assert response.status_code == 409
    assert "A customer with this phone number already exists." in response.text


@pytest.mark.asyncio
async def test_update_customer(app_client: AsyncClient) -> None:
    payload = {
        "name": "Update Corp",
        "phone": "555-1111",
    }
    create_resp = await app_client.post("/api/customers", json=payload)
    customer_id = create_resp.json()["id"]

    update_payload = {
        "address": "Updated Address"
    }
    update_resp = await app_client.patch(f"/api/customers/{customer_id}", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["address"] == "Updated Address"


@pytest.mark.asyncio
async def test_delete_customer(app_client: AsyncClient) -> None:
    payload = {
        "name": "Delete Corp",
        "phone": "555-2222",
    }
    create_resp = await app_client.post("/api/customers", json=payload)
    customer_id = create_resp.json()["id"]

    # Delete should succeed
    delete_resp = await app_client.delete(f"/api/customers/{customer_id}")
    assert delete_resp.status_code == 204

    # Verify it is gone
    get_resp = await app_client.get(f"/api/customers/{customer_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_customers(app_client: AsyncClient) -> None:
    payload1 = {"name": "List Corp A", "phone": "555-3331"}
    payload2 = {"name": "List Corp B", "phone": "555-3332"}
    await app_client.post("/api/customers", json=payload1)
    await app_client.post("/api/customers", json=payload2)

    list_resp = await app_client.get("/api/customers")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert len(data) >= 2
    names = [c["name"] for c in data]
    assert "List Corp A" in names
    assert "List Corp B" in names


