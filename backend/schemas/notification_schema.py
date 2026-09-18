import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from models.notification import NotificationType


class NotificationResponse(BaseModel):
    """Response schema for system notifications."""

    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None

    title: str
    message: str
    is_read: bool
    type: NotificationType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    """Schema used internally when creating a notification."""

    user_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None

    title: str
    message: str
    type: NotificationType


class NotificationMarkAllReadResponse(BaseModel):
    """Response returned after marking all notifications as read."""

    message: str
    updated_count: int