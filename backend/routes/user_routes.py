"""
backend/routes/user_routes.py
------------------------------
User management endpoints — fully wired to user_service.

    GET    /api/users/me
    PATCH  /api/users/me
    POST   /api/users/me/change-password
    GET    /api/users                     (admin only)
    GET    /api/users/{user_id}           (admin only)
    PATCH  /api/users/{user_id}           (admin only)
    DELETE /api/users/{user_id}           (admin only)
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import get_current_user, require_admin
from schemas.user_schema import ChangePasswordRequest, UserResponse, UserUpdate
from services.user_service import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


# ---------------------------------------------------------------------------
# Own profile endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current user's profile",
)
async def get_my_profile(
    current_user=Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update the current user's own profile",
)
async def update_my_profile(
    payload: UserUpdate,
    db: DatabaseSession,
    current_user=Depends(get_current_user),
) -> UserResponse:
    updated = await user_service.update_profile(db, current_user.id, payload)
    return UserResponse.model_validate(updated)


@router.post(
    "/me/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Change the current user's password",
)
async def change_my_password(
    payload: ChangePasswordRequest,
    db: DatabaseSession,
    current_user=Depends(get_current_user),
):
    await user_service.change_password(db, current_user.id, payload)


# ---------------------------------------------------------------------------
# Admin-only management
# ---------------------------------------------------------------------------


@router.get(
    "",
    response_model=list[UserResponse],
    summary="List all users (admin only)",
)
async def list_users(
    db: DatabaseSession,
    admin=Depends(require_admin),
) -> list[UserResponse]:
    users = await user_service.list_users(db)
    return [UserResponse.model_validate(u) for u in users]


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get a user by ID (admin only)",
)
async def get_user(
    user_id: uuid.UUID,
    db: DatabaseSession,
    admin=Depends(require_admin),
) -> UserResponse:
    user = await user_service.get_by_id(db, user_id)
    return UserResponse.model_validate(user)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user by ID (admin only)",
)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: DatabaseSession,
    admin=Depends(require_admin),
) -> UserResponse:
    updated = await user_service.update_user(db, user_id, payload)
    return UserResponse.model_validate(updated)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user by ID (admin only)",
)
async def delete_user(
    user_id: uuid.UUID,
    db: DatabaseSession,
    admin=Depends(require_admin),
):
    await user_service.delete_user(db, user_id)
