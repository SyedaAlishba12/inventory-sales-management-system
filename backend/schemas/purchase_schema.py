"""
backend/schemas/purchase_schema.py
------------------------------------
Pydantic request/response schemas for purchase order endpoints.

Field names and types are taken from the shared ERD spec.
A purchase order contains one or more line items (PurchaseItem).
"""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Purchase line-item schemas
# ---------------------------------------------------------------------------


class PurchaseItemCreate(BaseModel):
    """A single line item within a new purchase order."""

    product_id: UUID = Field(
        ...,
        description="UUID of the product being purchased.",
    )
    quantity: int = Field(
        ...,
        ge=1,
        description="Number of units ordered — must be at least 1.",
    )
    unit_price: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
        description="Price per unit at the time of the purchase.",
    )


class PurchaseItemResponse(BaseModel):
    """Read-only view of a single purchase line item."""

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Purchase order schemas
# ---------------------------------------------------------------------------


class PurchaseCreate(BaseModel):
    """Request body for POST /api/purchases."""

    supplier_id: UUID = Field(
        ...,
        description="UUID of the supplier fulfilling this order.",
    )
    items: list[PurchaseItemCreate] = Field(
        ...,
        min_length=1,
        description="At least one line item is required.",
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
        description="Optional free-text notes for this purchase order.",
    )


class PurchaseUpdate(BaseModel):
    """Partial update for an existing purchase order.

    Only non-None fields will be applied.  Line items cannot be updated
    individually through this schema — that requires a dedicated item endpoint.
    """

    status: str | None = Field(
        default=None,
        pattern="^(pending|received|cancelled)$",
        description="New status for the purchase order.",
    )
    notes: str | None = Field(default=None, max_length=500)


class PurchaseResponse(BaseModel):
    """Read-only view of a complete purchase order."""

    id: UUID
    supplier_id: UUID
    status: str
    total_amount: Decimal
    notes: str | None
    items: list[PurchaseItemResponse]

    model_config = {"from_attributes": True}
