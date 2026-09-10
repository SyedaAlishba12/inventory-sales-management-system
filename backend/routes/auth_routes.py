"""
backend/routes/auth_routes.py
------------------------------
Route stubs for authentication endpoints.

All paths match the division document spec:
    POST /api/auth/signup
    POST /api/auth/login
    POST /api/auth/refresh
    POST /api/auth/logout
    POST /api/auth/forgot-password
    POST /api/auth/reset-password

Service-layer calls raise NotImplementedError because:
    - backend/models/user.py (User ORM model) does not yet exist.
    - Without the User model there is no service implementation possible.

When backend/models/user.py lands:
    1. Create backend/services/auth_service.py with real business logic.
    2. Replace each NotImplementedError block with a service call.
    3. Remove the NotImplementedError import if no longer needed.
"""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from backend.middleware.auth_middleware import get_db, get_current_user
from backend.schemas.auth_schema import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from backend.schemas.user_schema import UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(
    payload: SignupRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.auth_service import AuthService
                return await AuthService(db).signup(payload)
    """
    raise NotImplementedError(
        "signup is blocked on backend/models/user.py — "
        "implement AuthService.signup() once the model exists."
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain JWT tokens",
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email + password and return access + refresh tokens.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.auth_service import AuthService
                return await AuthService(db).login(payload)
    """
    raise NotImplementedError(
        "login is blocked on backend/models/user.py — "
        "implement AuthService.login() once the model exists."
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate the supplied refresh token and issue a new access token.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.auth_service import AuthService
                return await AuthService(db).refresh(payload.refresh_token)
    """
    raise NotImplementedError(
        "refresh_token is blocked on backend/models/user.py — "
        "implement AuthService.refresh() once the model exists."
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Invalidate the current session",
)
async def logout(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log out the currently authenticated user.

    Blocked on: backend/models/user.py (User ORM model)
    Note: get_current_user() itself also raises NotImplementedError until
          the User model exists, so this will fail at the dependency layer.
    Next step:  from backend.services.auth_service import AuthService
                await AuthService(db).logout(current_user)
    """
    raise NotImplementedError(
        "logout is blocked on backend/models/user.py — "
        "implement AuthService.logout() once the model exists."
    )


@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request a password-reset email",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a password-reset email for the given address.

    Always returns 202 regardless of whether the email exists in the system,
    to avoid user enumeration.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.auth_service import AuthService
                await AuthService(db).forgot_password(payload.email)
    """
    raise NotImplementedError(
        "forgot_password is blocked on backend/models/user.py — "
        "implement AuthService.forgot_password() once the model exists."
    )


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Set a new password using a reset token",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate the reset token and update the user's password.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.auth_service import AuthService
                await AuthService(db).reset_password(payload)
    """
    raise NotImplementedError(
        "reset_password is blocked on backend/models/user.py — "
        "implement AuthService.reset_password() once the model exists."
    )
