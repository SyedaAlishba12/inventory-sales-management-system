import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from controllers.notification_controller import NotificationController
from database.session import get_db_session
from middleware.auth_middleware import require_staff
from models.user import User
from schemas.notification_schema import (
    NotificationMarkAllReadResponse,
    NotificationResponse,
)


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


# ============================================================
# GET ALL NOTIFICATIONS
# ============================================================

@router.get(
    "/",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
)
async def get_notifications(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    """
    Get notifications visible to the authenticated staff/admin user.
    """

    return await NotificationController.get_all_system_notifications(
        db=db,
        user_id=current_user.id,
    )


# ============================================================
# MARK ONE NOTIFICATION AS READ
# ============================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
)
async def mark_as_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    """
    Mark a single notification as read.
    """

    try:
        notification = (
            await NotificationController.mark_single_notification_read(
                db=db,
                notification_id=notification_id,
                user_id=current_user.id,
            )
        )

        await db.commit()
        await db.refresh(notification)

        return notification

    except Exception:
        await db.rollback()
        raise


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

@router.put(
    "/read-all",
    response_model=NotificationMarkAllReadResponse,
    status_code=status.HTTP_200_OK,
)
async def mark_all_read(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    """
    Mark all visible notifications as read.
    """

    try:
        result = (
            await NotificationController.mark_all_notifications_read(
                db=db,
                user_id=current_user.id,
            )
        )

        await db.commit()

        return result

    except Exception:
        await db.rollback()
        raise