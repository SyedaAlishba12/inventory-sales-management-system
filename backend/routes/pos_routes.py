from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status

from routes.deps import CurrentUserId, DatabaseSession
from schemas.sale import SaleCreate, SaleRead
from services.sales_service import sales_service

router = APIRouter(prefix="/api/pos", tags=["POS"])


@router.get("/products")
async def search_pos_products(
    search: Annotated[str, Query()] = "",
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
):
    """Product search/browse for the POS screen.

    - `search=""` (or omitted) -> browse mode: returns the first `limit`
      available products.
    - `search="mouse"` -> filtered by name/SKU.

    TODO: swap in Zainab's real product_service.search_available(...) once
    her products/inventory PR is merged. Returns an empty list for now so
    the POS page doesn't crash — it just shows "no products" until then,
    for both browse and search modes.
    """
    return []


@router.post("/checkout", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def pos_checkout(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    sale = await sales_service.checkout(session, user_id=user_id, payload=payload)
    return SaleRead.model_validate(sale)
