import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from models.inventory_movement import MovementType


class InventoryResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    current_stock: int
    opening_stock: int
    damaged_stock: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryMovementResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    movement_type: MovementType
    quantity: int
    previous_stock: int
    new_stock: int
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryAdjustmentCreate(BaseModel):
    product_id: uuid.UUID

    quantity: int = Field(
        ...,
        description=(
            "For STOCK_IN, STOCK_OUT and DAMAGED this is the quantity. "
            "For ADJUSTMENT this is the target stock level."
        ),
    )

    movement_type: MovementType

    reason: Optional[str] = Field(
        default=None,
        max_length=500,
    )