"""
backend/middleware/auth_middleware.py
--------------------------------------
JWT-based authentication dependencies for FastAPI route protection.

What is fully implemented here
--------------------------------
- OAuth2 bearer token extraction from the Authorization header via FastAPI's
  OAuth2PasswordBearer scheme.
- decode_token() call with proper 401 responses on missing / invalid / expired
  tokens.
- require_admin() and require_staff() role-check dependencies that operate on
  the user object returned by get_current_user().
- get_current_user() — everything except the actual DB query, which is blocked
  on backend/models/user.py not yet existing.

What is stubbed (with TODOs)
------------------------------
get_current_user(): The function signature, token decoding, and UUID extraction
are all complete.  The SQLAlchemy select() call is commented out pending the
User model.  The function currently raises NotImplementedError so callers fail
loudly rather than silently, and the stub comment shows exactly what to drop in
once the model lands.

Blocked on
-----------
- backend/models/user.py  — User ORM model (Zainab's / team assignment TBC)
- backend/database/session.py (or equivalent) — get_db() async session factory
  (likely Sayeel's, or comes with the database foundation already on his branch)
"""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from backend.common.security import decode_token

# ---------------------------------------------------------------------------
# OAuth2 scheme — extracts the Bearer token from the Authorization header.
# FastAPI uses this to generate the Swagger UI "Authorize" button as well.
# ---------------------------------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ---------------------------------------------------------------------------
# get_db dependency placeholder
# ---------------------------------------------------------------------------
# TODO: Once Sayeel's database session factory is available, replace this
#       import with:
#           from backend.database.session import get_db
#       For now the type annotation below uses AsyncSession so the stub is
#       type-correct without an actual import.

async def get_db():  # pragma: no cover
    """
    Placeholder — yields an AsyncSession for use in route dependencies.

    TODO: Replace this entire function body with the real session factory
          from backend.database.session once that module exists.
          Example implementation:
              async with async_session_maker() as session:
                  yield session
    """
    raise NotImplementedError(
        "get_db is blocked on backend/database/session.py — "
        "implement the async session factory there and import it here."
    )
    yield  # make this a generator so FastAPI treats it as a dependency


# ---------------------------------------------------------------------------
# get_current_user
# ---------------------------------------------------------------------------


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Extract, decode, and return the currently authenticated user.

    Args:
        token: Bearer token extracted from the Authorization header.
        db:    Async database session injected by FastAPI.

    Returns:
        The authenticated User ORM instance.

    Raises:
        HTTPException 401: If the token is missing, invalid, expired, or the
                           wrong type (not an access token).
        NotImplementedError: Until backend/models/user.py exists.
    """
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

    # TODO: once backend/models/user.py exists —
    # from backend.models.user import User
    # from sqlalchemy import select
    # result = await db.execute(select(User).where(User.id == user_id))
    # user = result.scalar_one_or_none()
    # if not user or not user.is_active:
    #     raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    # return user
    raise NotImplementedError(
        "get_current_user is blocked on backend/models/user.py — "
        "see TODO comment above for the exact implementation to drop in."
    )


# ---------------------------------------------------------------------------
# Role-check dependencies
# ---------------------------------------------------------------------------


async def require_admin(
    current_user: Annotated[object, Depends(get_current_user)],
) -> object:
    """FastAPI dependency that enforces admin-only access.

    Args:
        current_user: The user returned by get_current_user().

    Returns:
        The authenticated user if their role is 'admin'.

    Raises:
        HTTPException 403: If the user's role is not 'admin'.
        NotImplementedError: Propagated from get_current_user() until
                             backend/models/user.py lands.

    Usage:
        @router.delete("/api/users/{user_id}")
        async def delete_user(admin = Depends(require_admin)):
            ...
    """
    # current_user.role will be accessible once get_current_user() is unblocked.
    if getattr(current_user, "role", None) != "admin":
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
        current_user: The user returned by get_current_user().

    Returns:
        The authenticated user if their role is 'admin' or 'staff'.

    Raises:
        HTTPException 403: If the user's role is neither 'admin' nor 'staff'.
        NotImplementedError: Propagated from get_current_user() until
                             backend/models/user.py lands.

    Usage:
        @router.get("/api/customers")
        async def list_customers(user = Depends(require_staff)):
            ...
    """
    if getattr(current_user, "role", None) not in ("admin", "staff"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff or admin access required.",
        )
    return current_user
