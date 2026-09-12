from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from services.notification_service import NotificationService

class NotificationController:
    """Controller layer handling business logic orchestration for System Notifications."""

    @staticmethod
    async def get_all_system_notifications(db: AsyncSession):
        """Orchestrate retrieving all system notifications."""
        return await NotificationService.get_all_notifications(db)

    @staticmethod
    async def mark_single_notification_read(db: AsyncSession, notification_id: uuid.UUID):
        """Orchestrate marking a specific notification as read."""
        return await NotificationService.mark_notification_as_read(db, notification_id)

    @staticmethod
    async def mark_all_notifications_read(db: AsyncSession):
        """Orchestrate marking all system notifications as read."""
        return await NotificationService.mark_all_as_read(db)