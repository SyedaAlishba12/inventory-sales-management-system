from pydantic import BaseModel, Field, condecimal
from typing import Optional
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    """Base schema for Product attributes."""
    name: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    selling_price: condecimal(max_digits=10, decimal_places=2) = Field(...)
    cost_price: condecimal(max_digits=10, decimal_places=2) = Field(...)
    min_stock_level: int = Field(default=5, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    category_id: uuid.UUID

class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass

class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""
    name: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    selling_price: Optional[condecimal(max_digits=10, decimal_places=2)] = None
    cost_price: Optional[condecimal(max_digits=10, decimal_places=2)] = None
    min_stock_level: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    category_id: Optional[uuid.UUID] = None

class ProductResponse(ProductBase):
    """Schema for returning product details with system fields."""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True