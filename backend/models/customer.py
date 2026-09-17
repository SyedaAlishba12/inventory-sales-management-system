"""
backend/models/customer.py
---------------------------
Customer ORM model — Taha's module.

Customers are external parties who buy from the business.
They are distinct from Users (staff who operate the system).
"""

from decimal import Decimal
from uuid import UUID

from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Customer model storing contact and billing details."""

    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    phone: Mapped[str | None] = mapped_column(
        String(50), unique=True, index=True, nullable=True
    )
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    sales: Mapped[list["Sale"]] = relationship(
        "Sale",
        back_populates="customer",
    )

    def __repr__(self) -> str:
        return f"Customer(id={self.id!r}, name={self.name!r}, phone={self.phone!r})"
