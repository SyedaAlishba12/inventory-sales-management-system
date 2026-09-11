"""
backend/routes/supplier_routes.py
-----------------------------------
Supplier management endpoints — fully wired to supplier_service.

    POST   /api/suppliers
    GET    /api/suppliers
    GET    /api/suppliers/{supplier_id}
    PATCH  /api/suppliers/{supplier_id}
    DELETE /api/suppliers/{supplier_id}   (admin only)
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import require_admin, require_staff
from schemas.supplier_schema import SupplierCreate, SupplierResponse, SupplierUpdate
from services.supplier_service import supplier_service

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new supplier",
)
async def create_supplier(
    payload: SupplierCreate,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> SupplierResponse:
    created = await supplier_service.create(db, payload)
    return SupplierResponse.model_validate(created)


@router.get(
    "",
    response_model=list[SupplierResponse],
    summary="List all suppliers",
)
async def list_suppliers(
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> list[SupplierResponse]:
    suppliers = await supplier_service.list_all(db)
    return [SupplierResponse.model_validate(s) for s in suppliers]


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Get a supplier by ID",
)
async def get_supplier(
    supplier_id: uuid.UUID,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> SupplierResponse:
    supplier = await supplier_service.get(db, supplier_id)
    return SupplierResponse.model_validate(supplier)


@router.patch(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Update a supplier by ID",
)
async def update_supplier(
    supplier_id: uuid.UUID,
    payload: SupplierUpdate,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> SupplierResponse:
    updated = await supplier_service.update(db, supplier_id, payload)
    return SupplierResponse.model_validate(updated)


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a supplier by ID (admin only)",
)
async def delete_supplier(
    supplier_id: uuid.UUID,
    db: DatabaseSession,
    admin=Depends(require_admin),
):
    await supplier_service.delete(db, supplier_id)
