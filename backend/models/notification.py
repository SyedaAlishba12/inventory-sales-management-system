import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class Notification(Base):
    """Notification model for handling system alerts."""

    __tablename__ = "notifications"

    # Primary Key using native PostgreSQL UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Foreign Key linking to User
    # Nullable for broadcast notifications
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )

    # Foreign Key linking to Product
    # Nullable because not every notification is product-specific
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )

    # Notification content and status
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    type = Column(
        String(50),
        nullable=False,
        index=True,
    )  # LOW_STOCK, MULTIPLE_LOW_STOCK, NEW_SALE, PURCHASE_RECEIVED

    # UTC Timestamp
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships: Many-to-one with User
    user = relationship(
        "User",
        back_populates="notifications",
    )

    # Relationships: Many-to-one with Product
    product = relationship(
        "Product",
        back_populates="notifications",
    )

    def __repr__(self) -> str:
        return (
            f"Notification(id={self.id!r}, title={self.title!r}, "
            f"type={self.type!r}, is_read={self.is_read!r})"
        )