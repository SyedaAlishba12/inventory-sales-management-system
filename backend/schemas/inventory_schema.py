from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class InventoryResponse(BaseModel):
    """Schema for inventory summary response."""
    id: uuid.UUID
    product_id: uuid.UUID
    current_stock: int
    opening_stock: int
    damaged_stock: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryAdjustmentCreate(BaseModel):
    """Schema for manually adjusting stock or recording movements."""
    product_id: uuid.UUID
    quantity: int = Field(..., description="Quantity to add, remove, or adjust")
    movement_type: str = Field(..., description="STOCK_IN, STOCK_OUT, DAMAGED, or ADJUSTMENT")
    reason: Optional[str] = Field(None, max_length=500)