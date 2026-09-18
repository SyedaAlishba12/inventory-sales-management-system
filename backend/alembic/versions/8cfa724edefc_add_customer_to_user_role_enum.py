"""Add CUSTOMER to user_role enum

Revision ID: 8cfa724edefc
Revises: 9714bdf2ff84
Create Date: 2026-09-16 16:44:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '8cfa724edefc'
down_revision: str | Sequence[str] | None = '9714bdf2ff84'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Disable transaction to alter type safely in postgres
    op.execute("COMMIT")
    try:
        op.execute("ALTER TYPE user_role ADD VALUE 'CUSTOMER'")
    except Exception:
        pass


def downgrade() -> None:
    # Downgrading an ENUM type in postgres is not trivial. 
    # We will leave it as is.
    pass
