from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from schemas.activity_log import ActivityLogListResponse, ActivityLogRead
from services.activity_log_service import activity_log_service

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Logs"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("", response_model=ActivityLogListResponse)
async def list_activity_logs(
    session: DatabaseSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    user_id: Annotated[int | None, Query(gt=0)] = None,
    action: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    entity_type: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
    entity_id: Annotated[int | None, Query(gt=0)] = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> ActivityLogListResponse:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="start_date must be earlier than or equal to end_date",
        )
    items, total, total_pages = await activity_log_service.list(
        session,
        page=page,
        page_size=page_size,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        start_date=start_date,
        end_date=end_date,
    )
    return ActivityLogListResponse(
        items=[ActivityLogRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@router.get("/{activity_log_id}", response_model=ActivityLogRead)
async def get_activity_log(
    activity_log_id: Annotated[int, Path(gt=0)],
    session: DatabaseSession,
) -> ActivityLogRead:
    activity_log = await activity_log_service.get_by_id(session, activity_log_id)
    if activity_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity log not found",
        )
    return ActivityLogRead.model_validate(activity_log)
