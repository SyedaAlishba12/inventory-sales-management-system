from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import require_staff

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


async def get_current_user_id(
    current_user: Annotated[object, Depends(require_staff)],
) -> uuid.UUID:
    """Per the RBAC doc, Staff needs POS + Sales + Customer Selection access,
    so require_staff (admin or staff) is the right level here — not
    require_admin. Typed as `object` here (not User) to match Taha's own
    pattern in auth_middleware.py, which avoids importing the User model at
    module load time to prevent a circular import.
    """
    return current_user.id  # type: ignore[attr-defined]


CurrentUserId = Annotated[uuid.UUID, Depends(get_current_user_id)]
