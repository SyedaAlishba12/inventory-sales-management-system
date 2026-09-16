"""
backend/models/supplier.py
---------------------------
Supplier ORM model — Taha's module.

Suppliers are external parties who sell goods to the business (for purchases).
"""

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Supplier(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """External supplier from whom the business purchases stock."""

    __tablename__ = "suppliers"

    # --- Core fields ---------------------------------------------------------

    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    company: Mapped[str | None] = mapped_column(String(150), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(
        String(255), nullable=True, index=True
    )
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    # --- Relationships -------------------------------------------------------

    purchases: Mapped[list["Purchase"]] = relationship(
        "Purchase", back_populates="supplier"
    )

    def __repr__(self) -> str:
        return f"Supplier(id={self.id!r}, name={self.name!r})"
