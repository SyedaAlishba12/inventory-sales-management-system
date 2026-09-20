from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

from schemas.category_schema import CategoryResponse
from schemas.inventory_schema import InventoryResponse


class ProductBase(BaseModel):
    """Base schema for Product attributes defining core fields."""

    name: str = Field(
        ...,
        max_length=255,
        description="Name of the product"
    )

    sku: str = Field(
        ...,
        max_length=100,
        description="Stock Keeping Unit code"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Product description text"
    )

    selling_price: float = Field(
        ...,
        ge=0,
        description="Product selling price"
    )

    cost_price: float = Field(
        ...,
        ge=0,
        description="Product cost price"
    )

    min_stock_level: int = Field(
        default=5,
        ge=0,
        description="Minimum inventory stock threshold"
    )

    image_url: Optional[str] = Field(
        None,
        max_length=500,
        description="URL of the product image"
    )

    category_id: uuid.UUID = Field(
        ...,
        description="Unique UUID of the associated category"
    )


class ProductCreate(ProductBase):
    """Schema for validating new product creation payloads."""

    initial_stock: int = Field(
        default=0,
        ge=0,
        description="Initial stock count"
    )


class ProductUpdate(BaseModel):
    """Schema for validating product update requests."""

    name: Optional[str] = Field(
        None,
        max_length=255
    )

    sku: Optional[str] = Field(
        None,
        max_length=100
    )

    description: Optional[str] = Field(
        None,
        max_length=1000
    )

    selling_price: Optional[float] = Field(
        None,
        ge=0
    )

    cost_price: Optional[float] = Field(
        None,
        ge=0
    )

    min_stock_level: Optional[int] = Field(
        None,
        ge=0
    )

    image_url: Optional[str] = Field(
        None,
        max_length=500
    )

    category_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    """Schema for product API responses."""

    id: uuid.UUID
    name: str
    sku: str
    description: Optional[str] = None

    selling_price: float
    cost_price: float
    min_stock_level: int

    image_url: Optional[str] = None

    category_id: uuid.UUID

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    category: Optional[CategoryResponse] = None
    inventory: Optional[InventoryResponse] = None

    class Config:
        from_attributes = True