import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Enum
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
    # DB column is a native Postgres ENUM named "movement_type" (confirmed
    # by the checkout 500 error: "column movement_type is of type
    # movement_type but expression is of type character varying"). Alishba
    # said she fixed this exact thing before the migration ran; this file
    # reverted to plain String somewhere along the way — same class of
    # issue as the earlier stale-file problem, just not caused by my zip
    # this time. Fixing directly since it blocks every checkout.
    movement_type = Column(
        Enum(
            "STOCK_IN", "STOCK_OUT", "DAMAGED", "ADJUSTMENT",
            name="movement_type",
        ),
        nullable=False,
        index=True,
    )

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