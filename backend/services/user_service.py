"""
backend/services/user_service.py
----------------------------------
User management business logic.

Uses:
    common.security — verify_password, hash_password
    models.user     — User
    schemas.user_schema — UserUpdate, ChangePasswordRequest
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.security import hash_password, verify_password
from models.user import User
from schemas.user_schema import ChangePasswordRequest, UserUpdate, UserCreate
from services.activity_log_service import activity_log_service


class UserService:

    # ------------------------------------------------------------------
    # read operations
    # ------------------------------------------------------------------

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User:
        """Fetch a user by UUID; raise 404 if not found."""
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    async def list_users(self, db: AsyncSession) -> list[User]:
        """Return all registered users (admin-only)."""
        result = await db.execute(select(User).order_by(User.created_at.desc()))
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # profile update
    # ------------------------------------------------------------------

    async def update_profile(
        self, db: AsyncSession, user_id: uuid.UUID, payload: UserUpdate
    ) -> User:
        """Apply allowed profile fields to the user record.

        Only ``full_name`` and ``email`` may be changed this way.
        Raises:
            HTTPException 404: If the user is not found.
            HTTPException 409: If the new email is already taken by another user.
        """
        user = await self.get_by_id(db, user_id)

        if payload.full_name is not None:
            user.full_name = payload.full_name

        if payload.email is not None and payload.email != user.email:
            conflict = (
                await db.execute(select(User).where(User.email == payload.email))
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email is already in use by another account.",
                )
            user.email = payload.email

        await db.flush()
        await db.refresh(user)
        await db.commit()
        return user

    # ------------------------------------------------------------------
    # admin update
    # ------------------------------------------------------------------

    async def create_user(
        self, db: AsyncSession, payload: UserCreate, created_by: uuid.UUID
    ) -> User:
        """Create a user (admin only) and log the action."""
        conflict = (
            await db.execute(select(User).where(User.email == payload.email))
        ).scalar_one_or_none()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
            
        new_user = User(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=payload.role,
        )
        db.add(new_user)
        await db.flush()
        
        await activity_log_service.log(
            db,
            action="user.created",
            entity_type="user",
            entity_id=new_user.id,
            user_id=created_by,
            description=f"Admin created user {new_user.email}"
        )
        await db.commit()
        await db.refresh(new_user)
        return new_user

    async def update_user(
        self, db: AsyncSession, user_id: uuid.UUID, payload: UserUpdate
    ) -> User:
        """Admin update — delegates to update_profile for now.

        Admin-specific additional fields (e.g. role, is_active) can be
        added here once the admin schemas are extended.
        """
        return await self.update_profile(db, user_id, payload)

    # ------------------------------------------------------------------
    # change password
    # ------------------------------------------------------------------

    async def change_password(
        self, db: AsyncSession, user_id: uuid.UUID, payload: ChangePasswordRequest
    ) -> None:
        """Verify the current password then store the new hash.

        Raises:
            HTTPException 400: If the current password is wrong.
        """
        user = await self.get_by_id(db, user_id)
        if not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        user.password_hash = hash_password(payload.new_password)
        await db.flush()
        await db.commit()

    # ------------------------------------------------------------------
    # delete (admin)
    # ------------------------------------------------------------------

    async def delete_user(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        """Hard-delete a user by UUID.

        Raises:
            HTTPException 404: If the user is not found.
        """
        user = await self.get_by_id(db, user_id)
        await db.delete(user)
        await db.commit()


user_service = UserService()
