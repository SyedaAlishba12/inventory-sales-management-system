"""
backend/services/supplier_service.py
--------------------------------------
Supplier management business logic — full CRUD.

Uses:
    models.supplier      — Supplier
    schemas.supplier_schema — SupplierCreate, SupplierUpdate
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.supplier import Supplier
from schemas.supplier_schema import SupplierCreate, SupplierUpdate


class SupplierService:

    # ------------------------------------------------------------------
    # create
    # ------------------------------------------------------------------

    async def create(self, db: AsyncSession, payload: SupplierCreate) -> Supplier:
        """Create a new supplier."""
        supplier = Supplier(**payload.model_dump())
        db.add(supplier)
        await db.flush()
        await db.refresh(supplier)
        await db.commit()
        return supplier

    # ------------------------------------------------------------------
    # read
    # ------------------------------------------------------------------

    async def get(self, db: AsyncSession, supplier_id: uuid.UUID) -> Supplier:
        """Fetch a supplier by UUID; raise 404 if not found."""
        supplier = await db.get(Supplier, supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found.",
            )
        return supplier

    async def list_all(self, db: AsyncSession) -> list[Supplier]:
        """Return all suppliers ordered by creation date (newest first)."""
        result = await db.execute(
            select(Supplier).order_by(Supplier.created_at.desc())
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # update
    # ------------------------------------------------------------------

    async def update(
        self, db: AsyncSession, supplier_id: uuid.UUID, payload: SupplierUpdate
    ) -> Supplier:
        """Apply a partial update to a supplier.

        Raises:
            HTTPException 404: If the supplier is not found.
        """
        supplier = await self.get(db, supplier_id)

        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(supplier, field, value)

        await db.flush()
        await db.refresh(supplier)
        await db.commit()
        return supplier

    # ------------------------------------------------------------------
    # delete
    # ------------------------------------------------------------------

    async def delete(self, db: AsyncSession, supplier_id: uuid.UUID) -> None:
        """Hard-delete a supplier.

        Raises:
            HTTPException 404: If the supplier is not found.
        """
        supplier = await self.get(db, supplier_id)
        await db.delete(supplier)
        await db.commit()


supplier_service = SupplierService()
