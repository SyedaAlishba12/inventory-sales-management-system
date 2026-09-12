from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, UUIDPrimaryKeyMixin


class SaleItem(UUIDPrimaryKeyMixin, Base):
    """Note: only created_at, no updated_at — a sale line item is never
    edited after checkout, so TimestampMixin (which adds both) is not used.
    """

    __tablename__ = "sale_items"

    sale_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("sales.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    item_discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    line_subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    sale: Mapped["Sale"] = relationship("Sale", back_populates="items")

    product: Mapped["Product"] = relationship(
    "Product",
    back_populates="sale_items",
)

    def __repr__(self) -> str:
        return (
            f"SaleItem(id={self.id!r}, sale_id={self.sale_id!r}, "
            f"product_id={self.product_id!r}, quantity={self.quantity!r})"
        )