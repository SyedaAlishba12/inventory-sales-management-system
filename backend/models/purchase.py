"""
backend/models/purchase.py
---------------------------
Purchase order ORM model — Taha's module.

A purchase is raised against a Supplier, authorized by a User (staff).
It contains one or more PurchaseItems (in purchase_item.py).
"""

import enum
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PaymentStatus(str, enum.Enum):
    """Payment status of a purchase order."""

    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"


class PurchaseStatus(str, enum.Enum):
    """Fulfillment status of a purchase order."""

    PENDING = "PENDING"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"


class Purchase(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A purchase order raised against a supplier."""

    __tablename__ = "purchases"

    # --- Foreign Keys --------------------------------------------------------

    supplier_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("suppliers.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- Core fields ---------------------------------------------------------

    purchase_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(
            PaymentStatus,
            name="paymentstatus",
            values_callable=lambda e: [v.value for v in e],
        ),
        nullable=False,
        default=PaymentStatus.PENDING,
        server_default=PaymentStatus.PENDING.value,
    )
    purchase_status: Mapped[PurchaseStatus] = mapped_column(
        Enum(
            PurchaseStatus,
            name="purchasestatus",
            values_callable=lambda e: [v.value for v in e],
        ),
        nullable=False,
        default=PurchaseStatus.PENDING,
        server_default=PurchaseStatus.PENDING.value,
    )
    total_cost: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0.00",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # --- Relationships -------------------------------------------------------

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="purchases")
    user: Mapped["User"] = relationship("User", back_populates="purchases")
    items: Mapped[list["PurchaseItem"]] = relationship(
        "PurchaseItem",
        back_populates="purchase",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"Purchase(id={self.id!r}, supplier_id={self.supplier_id!r}, "
            f"payment_status={self.payment_status!r}, purchase_status={self.purchase_status!r}, total={self.total_cost!r})"
        )
