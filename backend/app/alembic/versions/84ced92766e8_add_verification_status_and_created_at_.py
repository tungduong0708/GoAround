"""Add verification_status and created_at to places

Revision ID: 84ced92766e8
Revises: b359e922889a
Create Date: 2025-12-19 00:34:23.327489

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "84ced92766e8"
down_revision: Union[str, Sequence[str], None] = "b359e922889a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "places",
        sa.Column(
            "verification_status",
            sa.String(20),
            server_default="pending",
            nullable=False,
        ),
    )
    op.add_column(
        "places",
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("places", "created_at")
    op.drop_column("places", "verification_status")
