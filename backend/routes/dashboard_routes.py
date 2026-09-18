from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from schemas.dashboard import DashboardResponse
from services.dashboard_service import dashboard_service


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

DatabaseSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    session: DatabaseSession,
) -> DashboardResponse:
    return await dashboard_service.get_dashboard(session)