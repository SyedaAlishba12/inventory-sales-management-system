"""
backend/schemas/auth_schema.py
------------------------------
Pydantic request/response schemas for the authentication endpoints.

Field names and types are taken from the shared ERD spec.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    """Request body for POST /api/auth/signup."""

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Jane Smith"],
    )
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["Str0ng!Pass"],
    )
    role: str = Field(
        default="staff",
        pattern="^(admin|staff)$",
        examples=["staff"],
        description="User role — 'admin' or 'staff'.",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce at least one uppercase, one digit, one special character."""
        has_upper = any(c.isupper() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()-_=+[]{}|;:',.<>?/" for c in v)
        if not (has_upper and has_digit and has_special):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one digit, and one special character."
            )
        return v


class LoginRequest(BaseModel):
    """Request body for POST /api/auth/login."""

    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=1, examples=["Str0ng!Pass"])


class TokenResponse(BaseModel):
    """Response body for successful login or token refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Request body for POST /api/auth/forgot-password."""

    email: EmailStr = Field(..., examples=["jane@example.com"])


class ResetPasswordRequest(BaseModel):
    """Request body for POST /api/auth/reset-password."""

    token: str = Field(..., description="The JWT reset token from the email link.")
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


class RefreshTokenRequest(BaseModel):
    """Request body for POST /api/auth/refresh."""

    refresh_token: str
