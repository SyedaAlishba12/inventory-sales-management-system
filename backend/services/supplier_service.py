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
from services.activity_log_service import activity_log_service


class SupplierService:

    # ------------------------------------------------------------------
    # create
    # ------------------------------------------------------------------

    async def create(self, db: AsyncSession, payload: SupplierCreate, user_id: uuid.UUID) -> Supplier:
        """Create a new supplier.
        Raises 409 if phone number already exists.
        """
        if payload.phone:
            conflict = (
                await db.execute(select(Supplier).where(Supplier.phone == payload.phone))
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A supplier with this phone number already exists.",
                )
        
        supplier = Supplier(**payload.model_dump())
        db.add(supplier)
        await db.flush()
        await db.refresh(supplier)
        
        await activity_log_service.log(
            db,
            action="supplier.created",
            entity_type="supplier",
            entity_id=supplier.id,
            user_id=user_id,
            description=f"Created supplier {supplier.name}"
        )
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
        self, db: AsyncSession, supplier_id: uuid.UUID, payload: SupplierUpdate, user_id: uuid.UUID
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
        
        await activity_log_service.log(
            db,
            action="supplier.updated",
            entity_type="supplier",
            entity_id=supplier.id,
            user_id=user_id,
            description=f"Updated supplier {supplier.name}"
        )
        await db.commit()
        return supplier

    # ------------------------------------------------------------------
    # delete
    # ------------------------------------------------------------------

    async def delete(self, db: AsyncSession, supplier_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Hard-delete a supplier.

        Raises:
            HTTPException 404: If the supplier is not found.
        """
        supplier = await self.get(db, supplier_id)
        name = supplier.name
        await db.delete(supplier)
        
        await activity_log_service.log(
            db,
            action="supplier.deleted",
            entity_type="supplier",
            entity_id=supplier_id,
            user_id=user_id,
            description=f"Deleted supplier {name}"
        )
        await db.commit()


supplier_service = SupplierService()
