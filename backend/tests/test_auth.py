import uuid
from collections.abc import AsyncIterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Column, Table, Uuid, insert, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from common.config import Settings
from common.security import create_access_token, decode_token
from database.base import Base
from database.session import create_database_engine, create_session_factory, get_db_session
from models.user import UserRole, User
from routes.auth_routes import router


TEST_USER_ID = uuid.uuid4()
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "Password123!"


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
        # Create a test user directly in DB for login tests
        from common.security import hash_password
        await connection.execute(
            insert(User).values(
                id=TEST_USER_ID,
                full_name="Test User",
                email=TEST_USER_EMAIL,
                password_hash=hash_password(TEST_USER_PASSWORD),
                role=UserRole.STAFF,
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
    test_app.include_router(router)

    async def override_session() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    test_app.dependency_overrides[get_db_session] = override_session
    transport = ASGITransport(app=test_app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_signup_success(app_client: AsyncClient, session_factory: async_sessionmaker[AsyncSession]) -> None:
    payload = {
        "full_name": "New User",
        "email": "newuser@example.com",
        "password": "StrongPassword123!"
    }
    response = await app_client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "STAFF"
    
    # Verify hashed password is not plaintext
    async with session_factory() as session:
        user = (await session.execute(select(User).where(User.email == "newuser@example.com"))).scalar_one()
        assert user.password_hash != "StrongPassword123!"
        assert user.role == UserRole.STAFF


@pytest.mark.asyncio
async def test_signup_duplicate_email_rejected(app_client: AsyncClient) -> None:
    payload = {
        "full_name": "Duplicate User",
        "email": TEST_USER_EMAIL,
        "password": "StrongPassword123!"
    }
    response = await app_client.post("/api/auth/signup", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_signup_weak_password_rejected(app_client: AsyncClient) -> None:
    payload = {
        "full_name": "Weak Pass User",
        "email": "weakpass@example.com",
        "password": "weak"
    }
    response = await app_client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(app_client: AsyncClient) -> None:
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    response = await app_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password_rejected(app_client: AsyncClient) -> None:
    payload = {
        "email": TEST_USER_EMAIL,
        "password": "WrongPassword123!",
    }
    response = await app_client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.text


def test_decode_token_rejects_invalid() -> None:
    # decoding an invalid/malformed token returns None
    assert decode_token("invalid.token.here") is None

@pytest.mark.asyncio
async def test_refresh_token(app_client: AsyncClient) -> None:
    payload = {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    response = await app_client.post("/api/auth/login", json=payload)
    refresh_token = response.json()["refresh_token"]

    response = await app_client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_logout(app_client: AsyncClient) -> None:
    payload = {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    response = await app_client.post("/api/auth/login", json=payload)
    access_token = response.json()["access_token"]

    response = await app_client.post("/api/auth/logout", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_forgot_and_reset_password(app_client: AsyncClient, caplog) -> None:
    import logging
    caplog.set_level(logging.INFO)
    
    response = await app_client.post("/api/auth/forgot-password", json={"email": TEST_USER_EMAIL})
    assert response.status_code == 202
    
    # Extract token from logs (assuming it's logged as "Password reset link: ...?token=XYZ")
    assert any("reset token" in record.message or "reset link" in record.message for record in caplog.records)
    
    # We will just generate a real token for the reset test using create_reset_token
    from common.security import create_reset_token
    reset_token = create_reset_token(str(TEST_USER_ID))
    
    response = await app_client.post(
        "/api/auth/reset-password",
        json={"token": reset_token, "new_password": "NewStrongPassword123!"}
    )
    assert response.status_code == 200
    
    # Reject with invalid token
    response = await app_client.post(
        "/api/auth/reset-password",
        json={"token": "invalid_token", "new_password": "AnotherPassword123!"}
    )
    assert response.status_code == 400
