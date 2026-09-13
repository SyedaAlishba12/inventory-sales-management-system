from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


# TODO: replace with Taha's real auth dependency once his auth module is
# wired up here, e.g. `from auth.dependencies import get_current_user_id`.
def get_current_user_id() -> uuid.UUID:
    """Placeholder until Taha's auth module lands."""
    return uuid.UUID("11111111-1111-1111-1111-111111111111")


CurrentUserId = Annotated[uuid.UUID, Depends(get_current_user_id)]
