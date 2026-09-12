"""
backend/routes/supplier_routes.py
-----------------------------------
Route stubs for supplier management endpoints.

All paths match the division document spec:
    POST   /api/suppliers
    GET    /api/suppliers
    GET    /api/suppliers/{supplier_id}
    PATCH  /api/suppliers/{supplier_id}
    DELETE /api/suppliers/{supplier_id}

Service-layer calls raise NotImplementedError because:
    - backend/models/supplier.py (Supplier ORM model) does not yet exist.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.middleware.auth_middleware import get_db, require_admin, require_staff
from backend.schemas.supplier_schema import (
    SupplierCreate,
    SupplierResponse,
    SupplierUpdate,
)

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new supplier",
)
async def create_supplier(
    payload: SupplierCreate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Create a new supplier record.

    Blocked on: backend/models/supplier.py (Supplier ORM model)
    Next step:  from backend.services.supplier_service import SupplierService
                return await SupplierService(db).create(payload)
    """
    raise NotImplementedError(
        "create_supplier is blocked on backend/models/supplier.py — "
        "implement SupplierService.create() once the model exists."
    )


@router.get(
    "",
    response_model=list[SupplierResponse],
    summary="List all suppliers",
)
async def list_suppliers(
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a list of all suppliers.

    Blocked on: backend/models/supplier.py (Supplier ORM model)
    Next step:  from backend.services.supplier_service import SupplierService
                return await SupplierService(db).list_all()
    """
    raise NotImplementedError(
        "list_suppliers is blocked on backend/models/supplier.py — "
        "implement SupplierService.list_all() once the model exists."
    )


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Get a supplier by ID",
)
async def get_supplier(
    supplier_id: uuid.UUID,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a single supplier by UUID.

    Blocked on: backend/models/supplier.py (Supplier ORM model)
    Next step:  from backend.services.supplier_service import SupplierService
                return await SupplierService(db).get(supplier_id)
    """
    raise NotImplementedError(
        "get_supplier is blocked on backend/models/supplier.py — "
        "implement SupplierService.get() once the model exists."
    )


@router.patch(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Update a supplier by ID",
)
async def update_supplier(
    supplier_id: uuid.UUID,
    payload: SupplierUpdate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Apply a partial update to a supplier record.

    Blocked on: backend/models/supplier.py (Supplier ORM model)
    Next step:  from backend.services.supplier_service import SupplierService
                return await SupplierService(db).update(supplier_id, payload)
    """
    raise NotImplementedError(
        "update_supplier is blocked on backend/models/supplier.py — "
        "implement SupplierService.update() once the model exists."
    )


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a supplier by ID (admin only)",
)
async def delete_supplier(
    supplier_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a supplier record (admin-only operation).

    Blocked on: backend/models/supplier.py (Supplier ORM model)
    Next step:  from backend.services.supplier_service import SupplierService
                await SupplierService(db).delete(supplier_id)
    """
    raise NotImplementedError(
        "delete_supplier is blocked on backend/models/supplier.py — "
        "implement SupplierService.delete() once the model exists."
    )
