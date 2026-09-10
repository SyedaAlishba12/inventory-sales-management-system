from datetime import datetime
from math import ceil
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.activity_log import ActivityLog
from schemas.activity_log import ActivityLogCreate


class ActivityLogService:
    async def log(
        self,
        session: AsyncSession,
        *,
        action: str,
        user_id: UUID | None = None,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        description: str | None = None,
    ) -> ActivityLog:
        """Add an audit event to the caller's current database transaction."""

        payload = ActivityLogCreate(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
        )
        activity_log = ActivityLog(**payload.model_dump())
        session.add(activity_log)
        await session.flush()
        await session.refresh(activity_log)
        return activity_log

    async def get_by_id(
        self,
        session: AsyncSession,
        activity_log_id: UUID,
    ) -> ActivityLog | None:
        return await session.get(ActivityLog, activity_log_id)

    async def list(
        self,
        session: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        user_id: UUID | None = None,
        action: str | None = None,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> tuple[list[ActivityLog], int, int]:
        filters = []
        if user_id is not None:
            filters.append(ActivityLog.user_id == user_id)
        if action:
            filters.append(ActivityLog.action == action.strip())
        if entity_type:
            filters.append(ActivityLog.entity_type == entity_type.strip())
        if entity_id is not None:
            filters.append(ActivityLog.entity_id == entity_id)
        if start_date is not None:
            filters.append(ActivityLog.created_at >= start_date)
        if end_date is not None:
            filters.append(ActivityLog.created_at <= end_date)

        count_statement = select(func.count()).select_from(ActivityLog).where(*filters)
        total = int((await session.execute(count_statement)).scalar_one())
        statement: Select[tuple[ActivityLog]] = (
            select(ActivityLog)
            .where(*filters)
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = list((await session.execute(statement)).scalars().all())
        return items, total, ceil(total / page_size) if total else 0


activity_log_service = ActivityLogService()
