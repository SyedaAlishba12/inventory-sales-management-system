from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class NotificationResponse(BaseModel):
    """Schema for system notification response."""
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None
    title: str
    message: str
    is_read: bool
    type: str
    created_at: datetime

    class Config:
        from_attributes = True