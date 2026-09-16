from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import or_, select

from models.inventory import Inventory
from models.product import Product
from routes.deps import CurrentUserId, DatabaseSession
from schemas.pos import PosProductRead
from schemas.sale import SaleCreate, SaleRead
from services.sales_service import sales_service

router = APIRouter(prefix="/api/pos", tags=["POS"])


@router.get("/products", response_model=list[PosProductRead])
async def search_pos_products(
    session: DatabaseSession,
    search: Annotated[str, Query()] = "",
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> list[PosProductRead]:
    """Product search/browse for the POS screen.

    Zainab's ProductService has no search/limit method (only
    get_all_products(), which returns everything with no stock joined), so
    this queries Product + Inventory directly rather than waiting on an
    addition to her service. If she later adds a proper search method,
    this can be simplified to call it instead.

    - `search=""` (or omitted) -> browse mode: first `limit` products.
    - `search="mouse"` -> filtered by name or SKU (case-insensitive).
    """
    stmt = select(Product, Inventory.current_stock).join(
        Inventory, Inventory.product_id == Product.id, isouter=True
    )

    trimmed = search.strip()
    if trimmed:
        pattern = f"%{trimmed}%"
        stmt = stmt.where(or_(Product.name.ilike(pattern), Product.sku.ilike(pattern)))

    stmt = stmt.limit(limit)
    rows = (await session.execute(stmt)).all()

    return [
        PosProductRead(
            id=product.id,
            name=product.name,
            sku=product.sku,
            price=product.selling_price,
            stock_quantity=current_stock or 0,
            image_url=product.image_url,
        )
        for product, current_stock in rows
    ]


@router.post("/checkout", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def pos_checkout(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    sale = await sales_service.checkout(session, user_id=user_id, payload=payload)
    return SaleRead.model_validate(sale)
