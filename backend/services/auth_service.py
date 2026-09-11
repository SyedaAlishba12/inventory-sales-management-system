"""
backend/services/auth_service.py
---------------------------------
Authentication business logic — signup, login, token refresh, password reset.

Uses:
    common.security  — hash_password, verify_password, create_access_token,
                       create_refresh_token, create_reset_token, decode_token
    models.user      — User, UserRole
    schemas.auth_schema — SignupRequest, LoginRequest, etc.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)
from models.user import User, UserRole
from schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from schemas.user_schema import UserResponse

from fastapi import HTTPException, status


class AuthService:
    # ------------------------------------------------------------------
    # signup
    # ------------------------------------------------------------------

    async def signup(self, db: AsyncSession, payload: SignupRequest) -> User:
        """Create a new user account.

        Raises:
            HTTPException 409: If the email is already registered.
        """
        existing = (
            await db.execute(select(User).where(User.email == payload.email))
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=UserRole(payload.role),
            is_active=True,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        await db.commit()
        return user

    # ------------------------------------------------------------------
    # login
    # ------------------------------------------------------------------

    async def login(self, db: AsyncSession, payload: LoginRequest) -> TokenResponse:
        """Authenticate with email + password; return JWT pair.

        Raises:
            HTTPException 401: On bad credentials or inactive account.
        """
        user = (
            await db.execute(select(User).where(User.email == payload.email))
        ).scalar_one_or_none()

        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated. Contact an administrator.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenResponse(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
        )

    # ------------------------------------------------------------------
    # refresh
    # ------------------------------------------------------------------

    async def refresh(self, db: AsyncSession, refresh_token: str) -> TokenResponse:
        """Validate a refresh token and issue a new access token.

        Raises:
            HTTPException 401: If the token is invalid, expired, or wrong type.
        """
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        import uuid
        user_id = uuid.UUID(payload["sub"])
        user = await db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenResponse(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
        )

    # ------------------------------------------------------------------
    # forgot_password
    # ------------------------------------------------------------------

    async def forgot_password(self, db: AsyncSession, email: str) -> None:
        """Generate a reset token for the given email.

        Always returns silently even when the email doesn't exist, to
        prevent user enumeration.

        TODO: integrate an email-sending service to deliver the reset link.
              For now the token is generated but not sent anywhere — wire
              the mailer once the email service is decided by the team.
        """
        user = (
            await db.execute(select(User).where(User.email == email))
        ).scalar_one_or_none()
        if not user or not user.is_active:
            # Return silently — do not reveal whether the address exists
            return

        _reset_token = create_reset_token(str(user.id))
        # TODO: send _reset_token via email to user.email
        # Coordinate with the team on which email library/service to use.

    # ------------------------------------------------------------------
    # reset_password
    # ------------------------------------------------------------------

    async def reset_password(self, db: AsyncSession, payload: ResetPasswordRequest) -> None:
        """Validate a reset token and update the user's password.

        Raises:
            HTTPException 400: If the token is invalid, expired, or wrong type.
            HTTPException 404: If the user no longer exists.
        """
        import uuid

        token_payload = decode_token(payload.token)
        if not token_payload or token_payload.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password-reset token.",
            )

        user_id = uuid.UUID(token_payload["sub"])
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        user.password_hash = hash_password(payload.new_password)
        await db.flush()
        await db.commit()


auth_service = AuthService()
