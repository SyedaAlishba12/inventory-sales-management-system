import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class Product(Base):
    """Product model managing product details, pricing, and stock limits."""

    __tablename__ = "products"

    # Primary Key using native PostgreSQL UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Foreign Key linking to Category
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )

    # Product attributes
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(String(1000), nullable=True)
    selling_price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    min_stock_level = Column(Integer, nullable=False, default=5)
    image_url = Column(String(500), nullable=True)

    # UTC Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships: Many-to-one with Category
    category = relationship("Category", back_populates="products")

    # Relationships: One-to-one with Inventory summary record
    inventory = relationship(
        "Inventory",
        back_populates="product",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Relationships: One-to-many with Inventory Movements log
    inventory_movements = relationship(
        "InventoryMovement",
        back_populates="product",
    )

    # Relationships: One-to-many with Notifications
    notifications = relationship(
        "Notification",
        back_populates="product",
    )

    # Cross-module external relationships
    # These models are owned by Taha and Fatima.
    purchase_items = relationship("PurchaseItem", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")

    def __repr__(self) -> str:
        return f"Product(id={self.id!r}, name={self.name!r}, sku={self.sku!r})"

