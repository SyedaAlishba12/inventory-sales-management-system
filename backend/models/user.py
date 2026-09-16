"""
backend/models/user.py
-----------------------
User ORM model — Taha's module.

Inherits from UUIDPrimaryKeyMixin (first) and TimestampMixin, then Base,
matching the pattern established in activity_log.py.

Cross-module back_populates required by existing team models:
  - inventory_movement.py  → user = relationship("User", back_populates="inventory_movements")
  - notification.py        → user = relationship("User", back_populates="notifications")

The 'purchases' relationship points back to Purchase (this module).
"""

import enum
from uuid import UUID

from sqlalchemy import Boolean, Enum, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    """Allowed user roles."""

    ADMIN = "ADMIN"
    STAFF = "STAFF"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Authenticated user of the Inventory & Sales Management System."""

    __tablename__ = "users"

    # --- Core fields ---------------------------------------------------------

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda e: [member.value for member in e],
        ),
        nullable=False,
        default=UserRole.STAFF,
        server_default=UserRole.STAFF.value,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    # --- Relationships -------------------------------------------------------

    # This module's own collections
    purchases: Mapped[list["Purchase"]] = relationship(
        "Purchase", back_populates="user"
    )

    # Required by Zainab's inventory_movement.py
    # (it declares: user = relationship("User", back_populates="inventory_movements"))
    inventory_movements: Mapped[list] = relationship(
        "InventoryMovement", back_populates="user"
    )

    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="user",
        passive_deletes=True,
    )

    # Required by Zainab's notification.py
    # (it declares: user = relationship("User", back_populates="notifications"))
    notifications: Mapped[list] = relationship(
        "Notification", back_populates="user"
    )

    sales: Mapped[list["Sale"]] = relationship(
        "Sale",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r}, role={self.role!r})"
