"""
backend/models/purchase_item.py
--------------------------------
PurchaseItem ORM model — Taha's module.

A line item within a purchase order.  One purchase → many items.
Each item references one Product (Zainab's model, __tablename__ = "products").

Cross-module note:
    product.py already declares:
        purchase_items = relationship("PurchaseItem", back_populates="product")
    So this model MUST declare back_populates="product" on the product relationship.
    No modification to product.py is needed.
"""

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, UUIDPrimaryKeyMixin


class PurchaseItem(UUIDPrimaryKeyMixin, Base):
    """A single line item within a purchase order."""

    __tablename__ = "purchase_items"

    # --- Foreign Keys --------------------------------------------------------

    purchase_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("purchases.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- Core fields ---------------------------------------------------------

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    cost_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --- Relationships -------------------------------------------------------

    purchase: Mapped["Purchase"] = relationship(
        "Purchase", back_populates="items"
    )
    # back_populates="product" is required because product.py already declares:
    #   purchase_items = relationship("PurchaseItem", back_populates="product")
    product: Mapped["Product"] = relationship(  # type: ignore[name-defined]
        "Product", back_populates="purchase_items"
    )

    @property
    def total_price(self) -> Decimal:
        """Computed line total — quantity × cost_price."""
        return Decimal(self.quantity) * self.cost_price

    def __repr__(self) -> str:
        return (
            f"PurchaseItem(id={self.id!r}, purchase_id={self.purchase_id!r}, "
            f"product_id={self.product_id!r}, qty={self.quantity!r})"
        )

