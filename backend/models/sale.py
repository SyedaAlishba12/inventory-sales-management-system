from __future__ import annotations

import enum
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Uuid, func
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    ONLINE = "ONLINE"


class SaleStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"
    CANCELLED = "CANCELLED"


class Sale(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "sales"

    invoice_number: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True, native_uuid=True),
        ForeignKey("customers.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    sale_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    tax: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        SqlEnum(PaymentMethod, name="payment_method", native_enum=True),
        nullable=False,
    )
    status: Mapped[SaleStatus] = mapped_column(
        SqlEnum(SaleStatus, name="sale_status", native_enum=True),
        nullable=False,
        default=SaleStatus.COMPLETED,
        server_default=SaleStatus.COMPLETED.value,
    )

    items: Mapped[list["SaleItem"]] = relationship(
        "SaleItem", back_populates="sale", cascade="all, delete-orphan"
    )
    user: Mapped["User"] = relationship(
    "User",
    back_populates="sales",
)

    customer: Mapped["Customer | None"] = relationship(
    "Customer",
    back_populates="sales",
)

    def __repr__(self) -> str:
        return f"Sale(id={self.id!r}, invoice_number={self.invoice_number!r}, total={self.total!r})"