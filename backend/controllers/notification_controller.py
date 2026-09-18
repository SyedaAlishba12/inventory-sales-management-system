import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from services.notification_service import NotificationService


class NotificationController:
    """Controller layer for system notifications."""

    # ============================================================
    # GET NOTIFICATIONS
    # ============================================================

    @staticmethod
    async def get_all_system_notifications(
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
    ):
        """Retrieve notifications visible to the current user."""

        return await NotificationService.get_all_notifications(
            db=db,
            user_id=user_id,
        )

    # ============================================================
    # MARK SINGLE AS READ
    # ============================================================

    @staticmethod
    async def mark_single_notification_read(
        db: AsyncSession,
        notification_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
    ):
        """Mark one notification as read."""

        return await NotificationService.mark_notification_as_read(
            db=db,
            notification_id=notification_id,
            user_id=user_id,
        )

    # ============================================================
    # MARK ALL AS READ
    # ============================================================

    @staticmethod
    async def mark_all_notifications_read(
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
    ):
        """Mark all visible notifications as read."""

        return await NotificationService.mark_all_as_read(
            db=db,
            user_id=user_id,
        )