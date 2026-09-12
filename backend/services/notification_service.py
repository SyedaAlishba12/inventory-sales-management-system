from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List
import uuid

from models.notification import Notification

class NotificationService:
    """Service layer for managing system notifications and alerts."""

    @staticmethod
    async def get_all_notifications(db: AsyncSession) -> List[Notification]:
        """Retrieve all system notifications ordered by creation date."""
        result = await db.execute(select(Notification).order_by(Notification.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def mark_notification_as_read(db: AsyncSession, notification_id: uuid.UUID) -> Notification:
        """Mark a specific notification as read."""
        notification = await db.get(Notification, notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found."
            )
        
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def mark_all_as_read(db: AsyncSession) -> dict:
        """Mark all unread notifications as read."""
        result = await db.execute(select(Notification).where(Notification.is_read == False))
        notifications = result.scalars().all()
        
        for notif in notifications:
            notif.is_read = True
            
        await db.commit()
        return {"message": "All notifications marked as read."}