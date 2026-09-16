"""
backend/middleware/auth_middleware.py
--------------------------------------
JWT-based authentication dependencies for FastAPI route protection.

Fully implemented:
- OAuth2 bearer token extraction (Authorization: Bearer header)
- decode_token() call with proper 401 on missing / invalid / expired tokens
- get_current_user() — real DB lookup against the now-real User model
- require_admin() and require_staff() role-check dependencies

Step 3 fix applied (2026-09-11):
    auth_middleware was originally written against a guessed function name
    get_db().  The real session factory is get_db_session() in
    database.session.  All references updated.

Step 4 fix applied (2026-09-11):
    get_current_user() now performs a real SQLAlchemy select(User) query.
    The NotImplementedError stub has been replaced.
"""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.security import decode_token
from database.session import get_db_session

# ---------------------------------------------------------------------------
# OAuth2 scheme — extracts the Bearer token from the Authorization header.
# FastAPI uses this to generate the Swagger UI "Authorize" button as well.
# ---------------------------------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ---------------------------------------------------------------------------
# get_current_user
# ---------------------------------------------------------------------------


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Extract, decode, and return the currently authenticated user.

    Args:
        token: Bearer token extracted from the Authorization header.
        db:    Async database session injected by FastAPI.

    Returns:
        The authenticated User ORM instance.

    Raises:
        HTTPException 401: If the token is missing, invalid, expired, or the
                           wrong type (not an access token), or if the user
                           is not found or is inactive.
    """
    # Import here to avoid circular import at module load time
    # (models.user imports from database.base; middleware is loaded before models
    # are registered if imported at the top level during app startup)
    from models.user import User  # noqa: PLC0415

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ---------------------------------------------------------------------------
# Role-check dependencies
# ---------------------------------------------------------------------------


async def require_admin(
    current_user: Annotated[object, Depends(get_current_user)],
) -> object:
    """FastAPI dependency that enforces admin-only access.

    Args:
        current_user: The User ORM instance returned by get_current_user().

    Returns:
        The authenticated user if their role is 'admin'.

    Raises:
        HTTPException 403: If the user's role is not 'admin'.

    Usage:
        @router.delete("/api/users/{user_id}")
        async def delete_user(admin = Depends(require_admin)):
            ...
    """
    from models.user import UserRole  # noqa: PLC0415

    if getattr(current_user, "role", None) != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


async def require_staff(
    current_user: Annotated[object, Depends(get_current_user)],
) -> object:
    """FastAPI dependency that allows both 'admin' and 'staff' roles.

    Args:
        current_user: The User ORM instance returned by get_current_user().

    Returns:
        The authenticated user if their role is 'admin' or 'staff'.

    Raises:
        HTTPException 403: If the user's role is neither 'admin' nor 'staff'.

    Usage:
        @router.get("/api/customers")
        async def list_customers(user = Depends(require_staff)):
            ...
    """
    from models.user import UserRole  # noqa: PLC0415

    if getattr(current_user, "role", None) not in (UserRole.ADMIN, UserRole.STAFF):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff or admin access required.",
        )
    return current_user
