import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class Inventory(Base):
    """Inventory summary model tracking stock counts per product."""

    __tablename__ = "inventory"

    # Primary Key using native PostgreSQL UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Foreign Key linking to Product (Unique for 1-to-1 relationship)
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Stock metrics
    current_stock = Column(Integer, nullable=False, default=0)
    opening_stock = Column(Integer, nullable=False, default=0)
    damaged_stock = Column(Integer, nullable=False, default=0)

    # UTC Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships: One-to-one back reference with Product
    product = relationship("Product", back_populates="inventory")

    def __repr__(self) -> str:
        return (
            f"Inventory(id={self.id!r}, product_id={self.product_id!r}, "
            f"current_stock={self.current_stock!r})"
        )