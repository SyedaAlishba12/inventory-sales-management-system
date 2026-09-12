from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from schemas.sale import SaleCreate, SaleListResponse, SaleRead
from services.invoice_service import generate_invoice_pdf
from services.sales_service import sales_service

sales_router = APIRouter(prefix="/api/sales", tags=["Sales"])
pos_router = APIRouter(prefix="/api/pos", tags=["POS"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


# TODO: replace with Taha's real auth dependency once his auth module is
# merged, e.g. `from auth.dependencies import get_current_user_id`.
def get_current_user_id() -> uuid.UUID:
    """Placeholder until Taha's auth module lands."""
    return uuid.UUID("00000000-0000-0000-0000-000000000001")


CurrentUserId = Annotated[uuid.UUID, Depends(get_current_user_id)]


async def _run_checkout(session: DatabaseSession, user_id: CurrentUserId, payload: SaleCreate) -> SaleRead:
    try:
        sale = await sales_service.complete_sale(session, user_id=user_id, payload=payload)
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    return SaleRead.model_validate(sale)


# --- /api/pos ---------------------------------------------------------------


@pos_router.get("/products")
async def search_pos_products(
    search: Annotated[str, Query(min_length=1)] = "",
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
):
    """Thin proxy over Zainab's product/inventory service for the POS search box.

    TODO: swap in Zainab's real product_service.search_available(...) once her
    products/inventory PR is merged. Returns an empty list for now so the POS
    page doesn't crash — it just shows "no matching products" until then.
    """
    return []


@pos_router.post("/checkout", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def pos_checkout(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    return await _run_checkout(session, user_id, payload)


# --- /api/sales ---------------------------------------------------------------


@sales_router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def create_sale(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    """Same underlying flow as POST /api/pos/checkout, exposed as a plain
    resource-creation endpoint per the API list in the task division doc."""
    return await _run_checkout(session, user_id, payload)


@sales_router.get("", response_model=SaleListResponse)
async def list_sales(
    session: DatabaseSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    payment_method: Annotated[str | None, Query(pattern="^(CASH|CARD|ONLINE)$")] = None,
    status_filter: Annotated[
        str | None, Query(alias="status", pattern="^(COMPLETED|PENDING|CANCELLED)$")
    ] = None,
) -> SaleListResponse:
    items, total, total_pages = await sales_service.list(
        session,
        page=page,
        page_size=page_size,
        payment_method=payment_method,
        status=status_filter,
    )
    return SaleListResponse(
        items=[SaleRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@sales_router.get("/{sale_id}", response_model=SaleRead)
async def get_sale(sale_id: uuid.UUID, session: DatabaseSession) -> SaleRead:
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return SaleRead.model_validate(sale)


@sales_router.get("/{sale_id}/invoice", response_model=SaleRead)
async def get_invoice(sale_id: uuid.UUID, session: DatabaseSession) -> SaleRead:
    # Invoice is a formatted view over Sale + SaleItem — no separate table,
    # per the finalized ERD discussion.
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return SaleRead.model_validate(sale)


@sales_router.get("/{sale_id}/invoice/pdf")
async def get_invoice_pdf(sale_id: uuid.UUID, session: DatabaseSession) -> Response:
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    pdf_bytes = generate_invoice_pdf(sale)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{sale.invoice_number}.pdf"',
        },
    )
