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
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """External customer who purchases goods from the business."""

    __tablename__ = "customers"

    # --- Core fields ---------------------------------------------------------

    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(
        String(20), nullable=False, unique=True, index=True
    )
    email: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True, index=True
    )
    address: Mapped[str | None] = mapped_column(Text, nullable=True)


    def __repr__(self) -> str:
        return f"Customer(id={self.id!r}, name={self.name!r}, phone={self.phone!r})"
