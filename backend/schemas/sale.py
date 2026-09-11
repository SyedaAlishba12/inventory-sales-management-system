from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PaymentMethod(str, Enum):
    CASH = "CASH"
    CARD = "CARD"
    ONLINE = "ONLINE"


class SaleStatus(str, Enum):
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"
    CANCELLED = "CANCELLED"


class SaleItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)
    item_discount: Decimal = Field(default=Decimal("0"), ge=0)


class SaleItemRead(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    item_discount: Decimal
    line_subtotal: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SaleCreate(BaseModel):
    customer_id: uuid.UUID | None = None
    items: list[SaleItemCreate] = Field(min_length=1)
    discount: Decimal = Field(default=Decimal("0"), ge=0)
    is_percent_discount: bool = False
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    payment_method: PaymentMethod

    @model_validator(mode="after")
    def validate_items(self) -> "SaleCreate":
        if not self.items:
            raise ValueError("cart must contain at least one item")
        return self


class SaleRead(BaseModel):
    id: uuid.UUID
    invoice_number: str
    user_id: uuid.UUID
    customer_id: uuid.UUID | None
    sale_date: datetime
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    payment_method: PaymentMethod
    status: SaleStatus
    created_at: datetime
    updated_at: datetime
    items: list[SaleItemRead]

    model_config = ConfigDict(from_attributes=True)


class SaleListResponse(BaseModel):
    items: list[SaleRead]
    page: int
    page_size: int
    total: int
    total_pages: int
