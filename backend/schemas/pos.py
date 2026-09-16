from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PosProductRead(BaseModel):
    id: uuid.UUID
    name: str
    sku: str
    price: Decimal
    stock_quantity: int
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
