"""
backend/schemas/supplier_schema.py
-----------------------------------
Pydantic request/response schemas for supplier management endpoints.

Field names and types are taken from the shared ERD spec.
"""

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SupplierCreate(BaseModel):
    """Request body for POST /api/suppliers."""

    name: str = Field(
        ..., min_length=1, max_length=150, examples=["Global Parts Ltd"]
    )
    contact_person: str | None = Field(
        default=None, max_length=100, examples=["John Doe"]
    )
    email: EmailStr | None = Field(
        default=None, examples=["john.doe@globalparts.com"]
    )
    phone: str | None = Field(
        default=None,
        max_length=20,
        pattern=r"^\+?[0-9\s\-()]{7,20}$",
        examples=["+44-20-7946-0958"],
    )
    address: str | None = Field(
        default=None, max_length=300, examples=["456 Commerce Ave, London"]
    )


class SupplierUpdate(BaseModel):
    """Partial update for an existing supplier.

    All fields are optional — only provided fields will be updated.
    """

    name: str | None = Field(default=None, min_length=1, max_length=150)
    contact_person: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(
        default=None,
        max_length=20,
        pattern=r"^\+?[0-9\s\-()]{7,20}$",
    )
    address: str | None = Field(default=None, max_length=300)


class SupplierResponse(BaseModel):
    """Read-only view of a Supplier record returned by the API."""

    id: UUID
    name: str
    contact_person: str | None
    email: str | None
    phone: str | None
    address: str | None

    model_config = {"from_attributes": True}
