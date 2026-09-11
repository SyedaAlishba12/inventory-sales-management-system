"""
backend/routes/purchase_routes.py
-----------------------------------
Purchase order endpoints — fully wired to purchase_service.

    POST   /api/purchases
    GET    /api/purchases
    GET    /api/purchases/{purchase_id}
    PATCH  /api/purchases/{purchase_id}
    DELETE /api/purchases/{purchase_id}   (admin only)
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import require_admin, require_staff
from schemas.purchase_schema import PurchaseCreate, PurchaseResponse, PurchaseUpdate
from services.purchase_service import purchase_service

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new purchase order",
)
async def create_purchase(
    payload: PurchaseCreate,
    db: DatabaseSession,
    current_user=Depends(require_staff),
) -> PurchaseResponse:
    created = await purchase_service.create(db, current_user, payload)
    return PurchaseResponse.model_validate(created)


@router.get(
    "",
    response_model=list[PurchaseResponse],
    summary="List all purchase orders",
)
async def list_purchases(
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> list[PurchaseResponse]:
    purchases = await purchase_service.list_all(db)
    return [PurchaseResponse.model_validate(p) for p in purchases]


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Get a purchase order by ID",
)
async def get_purchase(
    purchase_id: uuid.UUID,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> PurchaseResponse:
    purchase = await purchase_service.get(db, purchase_id)
    return PurchaseResponse.model_validate(purchase)


@router.patch(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Update a purchase order by ID",
)
async def update_purchase(
    purchase_id: uuid.UUID,
    payload: PurchaseUpdate,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> PurchaseResponse:
    updated = await purchase_service.update(db, purchase_id, payload)
    return PurchaseResponse.model_validate(updated)


@router.patch(
    "/{purchase_id}/receive",
    response_model=PurchaseResponse,
    summary="Mark a purchase order as received",
)
async def receive_purchase(
    purchase_id: uuid.UUID,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> PurchaseResponse:
    received = await purchase_service.receive_purchase(db, purchase_id)
    return PurchaseResponse.model_validate(received)


@router.delete(
    "/{purchase_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel / delete a purchase order (admin only)",
)
async def delete_purchase(
    purchase_id: uuid.UUID,
    db: DatabaseSession,
    admin=Depends(require_admin),
):
    await purchase_service.delete(db, purchase_id)
