"""
backend/routes/auth_routes.py
------------------------------
Authentication endpoints — fully wired to auth_service.

    POST /api/auth/signup
    POST /api/auth/login
    POST /api/auth/refresh
    POST /api/auth/logout        (stateless — token revocation is a TODO)
    POST /api/auth/forgot-password
    POST /api/auth/reset-password
"""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import get_current_user
from schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from schemas.user_schema import UserResponse
from services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(
    payload: SignupRequest,
    db: DatabaseSession,
) -> UserResponse:
    user = await auth_service.signup(db, payload)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain JWT tokens",
)
async def login(
    payload: LoginRequest,
    db: DatabaseSession,
) -> TokenResponse:
    return await auth_service.login(db, payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: DatabaseSession,
) -> TokenResponse:
    return await auth_service.refresh(db, payload.refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Invalidate the current session",
)
async def logout(
    current_user=Depends(get_current_user),
):
    """Stateless logout — client must discard tokens on 204.

    TODO: Once a Redis token-blocklist or refresh-token table is added,
          blocklist the jti claim here before returning.
    """
    return


@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request a password-reset email",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: DatabaseSession,
):
    await auth_service.forgot_password(db, payload.email)


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Set a new password using a reset token",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: DatabaseSession,
):
    await auth_service.reset_password(db, payload)
