from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, UUIDPrimaryKeyMixin


class ActivityLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("ix_activity_logs_entity", "entity_type", "entity_id"),
        Index("ix_activity_logs_created_at", "created_at"),
    )

    user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    entity_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self) -> str:
        return (
            f"ActivityLog(id={self.id!r}, action={self.action!r}, "
            f"entity_type={self.entity_type!r}, entity_id={self.entity_id!r})"
        )
