"""align product description type

Revision ID: 67c0f8e98940
Revises: 8cfa724edefc
Create Date: 2026-09-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '67c0f8e98940'
down_revision: Union[str, Sequence[str], None] = '8cfa724edefc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'products',
        'description',
        existing_type=sa.VARCHAR(length=1000),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'products',
        'description',
        existing_type=sa.Text(),
        type_=sa.VARCHAR(length=1000),
        existing_nullable=True,
    )
