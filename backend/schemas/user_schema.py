"""
backend/schemas/user_schema.py
------------------------------
Pydantic request/response schemas for user management endpoints.

Field names and types are taken from the shared ERD spec.
"""

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserResponse(BaseModel):
    """Read-only view of a User record returned by the API."""

    id: UUID
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Partial update for the authenticated user's own profile.

    All fields are optional — only provided fields will be updated.
    """

    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        examples=["Jane Smith"],
    )
    email: EmailStr | None = Field(default=None, examples=["jane@example.com"])


class ChangePasswordRequest(BaseModel):
    """Request body for POST /api/users/me/change-password."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        has_upper = any(c.isupper() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()-_=+[]{}|;:',.<>?/" for c in v)
        if not (has_upper and has_digit and has_special):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one digit, and one special character."
            )
        return v
