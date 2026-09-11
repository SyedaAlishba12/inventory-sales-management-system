"""
backend/schemas/customer_schema.py
-----------------------------------
Pydantic request/response schemas for customer management endpoints.

Field names and types are taken from the shared ERD spec.
"""

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    """Request body for POST /api/customers."""

    name: str = Field(..., min_length=1, max_length=150, examples=["Acme Corp"])
    email: EmailStr | None = Field(default=None, examples=["contact@acme.com"])
    phone: str | None = Field(
        default=None,
        max_length=20,
        pattern=r"^\+?[0-9\s\-()]{7,20}$",
        examples=["+1-800-555-0100"],
    )
    address: str | None = Field(default=None, max_length=300, examples=["123 Main St"])


class CustomerUpdate(BaseModel):
    """Partial update for an existing customer.

    All fields are optional — only provided fields will be updated.
    """

    name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(
        default=None,
        max_length=20,
        pattern=r"^\+?[0-9\s\-()]{7,20}$",
    )
    address: str | None = Field(default=None, max_length=300)


class CustomerResponse(BaseModel):
    """Read-only view of a Customer record returned by the API."""

    id: UUID
    name: str
    email: str | None
    phone: str | None
    address: str | None

    model_config = {"from_attributes": True}
