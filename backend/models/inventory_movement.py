import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class InventoryMovement(Base):
    """Audit trail model recording every stock change (In, Out, Damaged, Adjustment)."""

    __tablename__ = "inventory_movements"

    # Primary Key using native PostgreSQL UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Foreign Key linking to Product
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )

    # Foreign Key linking to User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )

    # Movement details
    movement_type = Column(
        String(50),
        nullable=False,
        index=True,
    )  # STOCK_IN, STOCK_OUT, DAMAGED, ADJUSTMENT

    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)

    # UTC Timestamp
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships: Many-to-one with Product
    product = relationship(
        "Product",
        back_populates="inventory_movements",
    )

    # Relationships: Many-to-one with User
    user = relationship(
        "User",
        back_populates="inventory_movements",
    )

    def __repr__(self) -> str:
        return (
            f"InventoryMovement(id={self.id!r}, type={self.movement_type!r}, "
            f"quantity={self.quantity!r}, new_stock={self.new_stock!r})"
        )