from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response, status

from routes.deps import CurrentUserId, DatabaseSession
from schemas.sale import SaleCreate, SaleListResponse, SaleRead
from services.invoice_service import generate_invoice_pdf
from services.sales_service import sales_service

router = APIRouter(prefix="/api/sales", tags=["Sales"])


@router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def create_sale(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    """Same underlying flow as POST /api/pos/checkout, exposed as a plain
    resource-creation endpoint per the API list in the task division doc."""
    sale = await sales_service.checkout(session, user_id=user_id, payload=payload)
    return SaleRead.model_validate(sale)


@router.get("", response_model=SaleListResponse)
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


@router.get("/{sale_id}", response_model=SaleRead)
async def get_sale(sale_id: uuid.UUID, session: DatabaseSession) -> SaleRead:
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return SaleRead.model_validate(sale)


@router.get("/{sale_id}/invoice", response_model=SaleRead)
async def get_invoice(sale_id: uuid.UUID, session: DatabaseSession) -> SaleRead:
    # Invoice is a formatted view over Sale + SaleItem — no separate table,
    # per the finalized ERD discussion.
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return SaleRead.model_validate(sale)


@router.get("/{sale_id}/invoice/pdf")
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
