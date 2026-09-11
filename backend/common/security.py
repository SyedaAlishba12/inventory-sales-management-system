"""
backend/common/security.py
--------------------------
Password hashing and JWT token utilities for the Inventory & Sales Management System.

Dependencies (all present in requirements.txt):
    argon2-cffi==25.1.0   — password hashing
    python-jose==3.5.0    — JWT creation / verification
    python-dotenv==1.2.3  — .env loading for the os.getenv fallback below

NOTE — SECRET_KEY / ALGORITHM config:
    backend/common/config.py (Sayeel's branch, commit f9788ac) only exposes
    database and CORS settings.  It does NOT yet have SECRET_KEY or ALGORITHM
    fields on the Settings class.

    TODO: Once Sayeel adds SECRET_KEY / ALGORITHM to Settings, replace the
          two os.getenv calls below with:
              from backend.common.config import get_settings
              _settings = get_settings()
              _SECRET_KEY = _settings.secret_key
              _ALGORITHM  = _settings.algorithm
          and remove the python-dotenv load_dotenv() call.
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError, VerificationError
from dotenv import load_dotenv
from jose import JWTError, jwt

# ---------------------------------------------------------------------------
# Config — env-var fallback until config.py exposes these fields
# ---------------------------------------------------------------------------

# Load .env so os.getenv picks up values when running without an external
# process that already exports them (e.g. local dev, pytest).
load_dotenv()

# TODO: switch to settings.secret_key once config.py exposes it
_SECRET_KEY: str = os.getenv("SECRET_KEY", "")
if not _SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. "
        "Add it to your .env file or the process environment."
    )

# TODO: switch to settings.algorithm once config.py exposes it
_ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

# Token lifetimes — also env-configurable, sensible defaults provided.
_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)
_REFRESH_TOKEN_EXPIRE_DAYS: int = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")
)
_RESET_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "15")
)

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
