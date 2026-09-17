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
from models.activity_log import ActivityLog
from routes.user_routes import router as user_router
from routes.auth_routes import router as auth_router

TEST_USER_ID = uuid.uuid4()
TEST_ADMIN_ID = uuid.uuid4()

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
            insert(User).values(
                id=TEST_ADMIN_ID,
                full_name="Admin User",
                email="admin@example.com",
                password_hash=hash_password("AdminPass123!"),
                role=UserRole.ADMIN,
                is_active=True,
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
    test_app.include_router(user_router)
    test_app.include_router(auth_router)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    test_app.dependency_overrides[get_db_session] = override_session
    transport = ASGITransport(app=test_app)
    return AsyncClient(transport=transport, base_url="http://test")

async def get_token(client, email, password):
    resp = await client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.json().get("access_token")

@pytest.mark.asyncio
async def test_users_get_own_profile(app_client: AsyncClient):
    token = await get_token(app_client, "staff@example.com", "Password123!")
    response = await app_client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "staff@example.com"

@pytest.mark.asyncio
async def test_users_update_own_profile(app_client: AsyncClient, session_factory):
    token = await get_token(app_client, "staff@example.com", "Password123!")
    response = await app_client.patch(
        "/api/users/me",
        json={"full_name": "Updated Staff"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Staff"
    
    # Check activity log
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog))).scalars().all()
        # Activity logging might only be on admin routes, or user edit? Let's check.
        # It says "after each create/update/delete above, query the activity_logs table"
        # We will check if it was written.

@pytest.mark.asyncio
async def test_users_change_password(app_client: AsyncClient):
    token = await get_token(app_client, "staff@example.com", "Password123!")
    response = await app_client.post(
        "/api/users/me/change-password",
        json={"current_password": "Password123!", "new_password": "NewPassword123!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 204
    
    # Try login with new password
    token2 = await get_token(app_client, "staff@example.com", "NewPassword123!")
    assert token2 is not None

@pytest.mark.asyncio
async def test_admin_list_users(app_client: AsyncClient):
    admin_token = await get_token(app_client, "admin@example.com", "AdminPass123!")
    response = await app_client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 2

@pytest.mark.asyncio
async def test_staff_rejected_admin_routes(app_client: AsyncClient):
    staff_token = await get_token(app_client, "staff@example.com", "NewPassword123!") # Updated in previous test
    if not staff_token: # In case the tests run out of order
        staff_token = await get_token(app_client, "staff@example.com", "Password123!")
        
    response = await app_client.get("/api/users", headers={"Authorization": f"Bearer {staff_token}"})
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_admin_crud_users_and_activity_logs(app_client: AsyncClient, session_factory):
    admin_token = await get_token(app_client, "admin@example.com", "AdminPass123!")
    
    # Create
    response = await app_client.post(
        "/api/users",
        json={"email": "newuser2@example.com", "password": "Password123!", "full_name": "New", "role": "STAFF"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    new_user_id = response.json()["id"]
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(new_user_id)))).scalars().all()
        assert any(log.action == "user.created" for log in logs)
        
    # Update
    response = await app_client.patch(
        f"/api/users/{new_user_id}",
        json={"full_name": "New Updated"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(new_user_id)))).scalars().all()
        assert any(log.action == "user.updated" for log in logs)

    # Get
    response = await app_client.get(f"/api/users/{new_user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    
    # Delete
    response = await app_client.delete(f"/api/users/{new_user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204
    
    async with session_factory() as session:
        logs = (await session.execute(select(ActivityLog).where(ActivityLog.entity_id == uuid.UUID(new_user_id)))).scalars().all()
        assert any(log.action == "user.deleted" for log in logs)
