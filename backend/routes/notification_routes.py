from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database.session import get_db
from controllers.notification_controller import NotificationController
from schemas.notification_schema import NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(db: AsyncSession = Depends(get_db)):
    """API endpoint to get all system notifications."""
    return await NotificationController.get_all_system_notifications(db)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(notification_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """API endpoint to mark a specific notification as read."""
    return await NotificationController.mark_single_notification_read(db, notification_id)

@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(db: AsyncSession = Depends(get_db)):
    """API endpoint to mark all notifications as read."""
    return await NotificationController.mark_all_notifications_read(db)