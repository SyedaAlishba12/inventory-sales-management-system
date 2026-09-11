"""
backend/routes/purchase_routes.py
-----------------------------------
Route stubs for purchase order endpoints.

All paths match the division document spec:
    POST   /api/purchases
    GET    /api/purchases
    GET    /api/purchases/{purchase_id}
    PATCH  /api/purchases/{purchase_id}
    DELETE /api/purchases/{purchase_id}

Service-layer calls raise NotImplementedError because:
    - backend/models/purchase.py (Purchase ORM model) does not yet exist.
    - backend/models/purchase_item.py (PurchaseItem ORM model) does not yet exist.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.middleware.auth_middleware import get_db, require_admin, require_staff
from backend.schemas.purchase_schema import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseUpdate,
)

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new purchase order",
)
async def create_purchase(
    payload: PurchaseCreate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Create a new purchase order with one or more line items.

    Blocked on: backend/models/purchase.py, backend/models/purchase_item.py
    Next step:  from backend.services.purchase_service import PurchaseService
                return await PurchaseService(db).create(payload)
    """
    raise NotImplementedError(
        "create_purchase is blocked on backend/models/purchase.py and "
        "backend/models/purchase_item.py — "
        "implement PurchaseService.create() once those models exist."
    )


@router.get(
    "",
    response_model=list[PurchaseResponse],
    summary="List all purchase orders",
)
async def list_purchases(
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a list of all purchase orders.

    Blocked on: backend/models/purchase.py, backend/models/purchase_item.py
    Next step:  from backend.services.purchase_service import PurchaseService
                return await PurchaseService(db).list_all()
    """
    raise NotImplementedError(
        "list_purchases is blocked on backend/models/purchase.py — "
        "implement PurchaseService.list_all() once the model exists."
    )


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Get a purchase order by ID",
)
async def get_purchase(
    purchase_id: uuid.UUID,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a single purchase order (with its line items) by UUID.

    Blocked on: backend/models/purchase.py, backend/models/purchase_item.py
    Next step:  from backend.services.purchase_service import PurchaseService
                return await PurchaseService(db).get(purchase_id)
    """
    raise NotImplementedError(
        "get_purchase is blocked on backend/models/purchase.py — "
        "implement PurchaseService.get() once the model exists."
    )


@router.patch(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Update a purchase order by ID",
)
async def update_purchase(
    purchase_id: uuid.UUID,
    payload: PurchaseUpdate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Apply a partial update (e.g. change status, update notes) to a purchase order.

    Blocked on: backend/models/purchase.py
    Next step:  from backend.services.purchase_service import PurchaseService
                return await PurchaseService(db).update(purchase_id, payload)
    """
    raise NotImplementedError(
        "update_purchase is blocked on backend/models/purchase.py — "
        "implement PurchaseService.update() once the model exists."
    )


@router.delete(
    "/{purchase_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel / delete a purchase order (admin only)",
)
async def delete_purchase(
    purchase_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Cancel or delete a purchase order (admin-only operation).

    Blocked on: backend/models/purchase.py
    Next step:  from backend.services.purchase_service import PurchaseService
                await PurchaseService(db).delete(purchase_id)
    """
    raise NotImplementedError(
        "delete_purchase is blocked on backend/models/purchase.py — "
        "implement PurchaseService.delete() once the model exists."
    )
