from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from schemas.sale import SaleCreate, SaleListResponse, SaleRead
from services.sales_service import sales_service

router = APIRouter(prefix="/api/sales", tags=["Sales"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


# TODO: replace with Taha's real auth dependency once his auth module is
# merged, e.g. `from auth.dependencies import get_current_user_id`.
def get_current_user_id() -> uuid.UUID:
    """Placeholder until Taha's auth module lands."""
    return uuid.UUID("00000000-0000-0000-0000-000000000001")


CurrentUserId = Annotated[uuid.UUID, Depends(get_current_user_id)]


@router.post("/checkout", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: SaleCreate,
    session: DatabaseSession,
    user_id: CurrentUserId,
) -> SaleRead:
    try:
        sale = await sales_service.complete_sale(session, user_id=user_id, payload=payload)
        await session.commit()
    except Exception:
        await session.rollback()
        raise
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
    # Invoice is a formatted view over Sale + SaleItem — no separate table.
    sale = await sales_service.get_by_id(session, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return SaleRead.model_validate(sale)
