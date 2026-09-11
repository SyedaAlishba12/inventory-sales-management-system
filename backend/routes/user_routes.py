"""
backend/routes/user_routes.py
------------------------------
Route stubs for user management endpoints.

All paths match the division document spec:
    GET    /api/users/me
    PATCH  /api/users/me
    POST   /api/users/me/change-password
    GET    /api/users          (admin only)
    GET    /api/users/{user_id} (admin only)
    PATCH  /api/users/{user_id} (admin only)
    DELETE /api/users/{user_id} (admin only)

Service-layer calls raise NotImplementedError because:
    - backend/models/user.py (User ORM model) does not yet exist.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.middleware.auth_middleware import (
    get_current_user,
    get_db,
    require_admin,
)
from backend.schemas.user_schema import ChangePasswordRequest, UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


# ---------------------------------------------------------------------------
# Authenticated user's own profile
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current user's profile",
)
async def get_my_profile(
    current_user=Depends(get_current_user),
):
    """Return the authenticated user's own profile.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  return current_user  (once get_current_user() returns a real User)
    """
    raise NotImplementedError(
        "get_my_profile is blocked on backend/models/user.py — "
        "once get_current_user() returns a real User, simply return current_user."
    )


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update the current user's own profile",
)
async def update_my_profile(
    payload: UserUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's own full_name or email.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                return await UserService(db).update_profile(current_user.id, payload)
    """
    raise NotImplementedError(
        "update_my_profile is blocked on backend/models/user.py — "
        "implement UserService.update_profile() once the model exists."
    )


@router.post(
    "/me/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Change the current user's password",
)
async def change_my_password(
    payload: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify the current password and set a new one.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                await UserService(db).change_password(current_user.id, payload)
    """
    raise NotImplementedError(
        "change_my_password is blocked on backend/models/user.py — "
        "implement UserService.change_password() once the model exists."
    )


# ---------------------------------------------------------------------------
# Admin-only user management
# ---------------------------------------------------------------------------


@router.get(
    "",
    response_model=list[UserResponse],
    summary="List all users (admin only)",
)
async def list_users(
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return a list of all registered users.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                return await UserService(db).list_users()
    """
    raise NotImplementedError(
        "list_users is blocked on backend/models/user.py — "
        "implement UserService.list_users() once the model exists."
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a user by ID (admin only)",
)
async def get_user(
    user_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return a single user by UUID.

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                return await UserService(db).get_user(user_id)
    """
    raise NotImplementedError(
        "get_user is blocked on backend/models/user.py — "
        "implement UserService.get_user() once the model exists."
    )


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user by ID (admin only)",
)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update any user's profile (admin-only operation).

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                return await UserService(db).update_user(user_id, payload)
    """
    raise NotImplementedError(
        "update_user is blocked on backend/models/user.py — "
        "implement UserService.update_user() once the model exists."
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user by ID (admin only)",
)
async def delete_user(
    user_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete or hard-delete a user (admin-only operation).

    Blocked on: backend/models/user.py (User ORM model)
    Next step:  from backend.services.user_service import UserService
                await UserService(db).delete_user(user_id)
    """
    raise NotImplementedError(
        "delete_user is blocked on backend/models/user.py — "
        "implement UserService.delete_user() once the model exists."
    )
