"""
backend/common/security.py
--------------------------
Password hashing and JWT token utilities for the Inventory & Sales Management System.

Dependencies (all present in requirements.txt):
    argon2-cffi==25.1.0   — password hashing
    python-jose==3.5.0    — JWT creation / verification
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError, VerificationError
from jose import JWTError, jwt

from common.config import get_settings

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_settings = get_settings()

_SECRET_KEY: str = _settings.secret_key
if not _SECRET_KEY or _SECRET_KEY == "change_me_in_production":
    if _settings.app_env == "production":
        raise RuntimeError("SECRET_KEY must be changed in production.")

_ALGORITHM: str = _settings.algorithm

# Token lifetimes
_ACCESS_TOKEN_EXPIRE_MINUTES: int = _settings.access_token_expire_minutes
_REFRESH_TOKEN_EXPIRE_DAYS: int = _settings.refresh_token_expire_days
_RESET_TOKEN_EXPIRE_MINUTES: int = _settings.reset_token_expire_minutes

# ---------------------------------------------------------------------------
# Password hashing — argon2
# ---------------------------------------------------------------------------

_ph = PasswordHasher(
    time_cost=3,        # number of iterations
    memory_cost=65536,  # 64 MiB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain_password: str) -> str:
    """Return an Argon2id hash of *plain_password*.

    Args:
        plain_password: The raw password string supplied by the user.

    Returns:
        A self-contained Argon2 hash string (includes salt, parameters, etc.)
        suitable for storage in the database.
    """
    return _ph.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify *plain_password* against an Argon2 *hashed_password*.

    Args:
        plain_password:  The raw password string supplied by the user.
        hashed_password: The stored Argon2 hash string.

    Returns:
        ``True`` if the password matches, ``False`` otherwise.
        Never raises on a mismatch — exceptions from argon2-cffi are caught
        and converted to a ``False`` return value.
    """
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _build_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Internal helper — create a signed JWT with a standard claim set.

    Args:
        subject:      The ``sub`` claim — typically the user's UUID as a string.
        token_type:   Stored in the ``type`` claim; used by consumers to
                      distinguish access / refresh / reset tokens and reject
                      wrong token types at each endpoint.
        expires_delta: How long until the token expires.
        extra_claims:  Any additional claims to merge into the payload.

    Returns:
        A signed JWT string.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": str(uuid.uuid4()),   # unique token ID — enables future revocation
        **(extra_claims or {}),
    }
    return jwt.encode(payload, _SECRET_KEY, algorithm=_ALGORITHM)


def create_access_token(user_id: str, role: str) -> str:
    """Create a short-lived JWT access token.

    Args:
        user_id: The user's UUID (as a string).
        role:    The user's role string (e.g. ``"admin"``, ``"staff"``).
                 Embedded so middleware can gate endpoints without an extra
                 DB round-trip.

    Returns:
        A signed JWT access token string.
    """
    return _build_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=_ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived JWT refresh token.

    Args:
        user_id: The user's UUID (as a string).

    Returns:
        A signed JWT refresh token string.  Consumers MUST verify that
        ``payload["type"] == "refresh"`` before issuing a new access token.
    """
    return _build_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=_REFRESH_TOKEN_EXPIRE_DAYS),
    )


def create_reset_token(user_id: str) -> str:
    """Create a short-lived JWT password-reset token.

    Args:
        user_id: The user's UUID (as a string).

    Returns:
        A signed JWT reset token string.  Consumers MUST verify that
        ``payload["type"] == "reset"`` before allowing a password change.
    """
    return _build_token(
        subject=user_id,
        token_type="reset",
        expires_delta=timedelta(minutes=_RESET_TOKEN_EXPIRE_MINUTES),
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and verify a JWT, returning its payload.

    Args:
        token: A JWT string (access, refresh, or reset).

    Returns:
        The decoded payload dictionary if the token is valid and not expired,
        or ``None`` if the token is invalid, expired, or tampered with.
        Callers are responsible for checking ``payload["type"]`` to ensure
        the correct token type is being used for the operation at hand.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token, _SECRET_KEY, algorithms=[_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
