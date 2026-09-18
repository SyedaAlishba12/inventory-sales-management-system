from __future__ import annotations

from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from models.sale import PaymentMethod, SaleStatus
from schemas.report import (
    CustomerReportResponse,
    FinancialReportResponse,
    InventoryReportResponse,
    ProductReportResponse,
    SalesReportResponse,
    StockMovementReportResponse,
    SupplierReportResponse,
    PurchaseReportResponse,
)
from services.report_service import report_service


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)

DatabaseSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


@router.get("/sales", response_model=SalesReportResponse)
async def get_sales_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    payment_method: Optional[PaymentMethod] = Query(None),
    status: Optional[SaleStatus] = Query(None),
) -> SalesReportResponse:
    return await report_service.get_sales_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
        payment_method=payment_method,
        status=status,
    )


@router.get("/products", response_model=ProductReportResponse)
async def get_product_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> ProductReportResponse:
    return await report_service.get_product_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/inventory", response_model=InventoryReportResponse)
async def get_inventory_report(
    session: DatabaseSession,
) -> InventoryReportResponse:
    return await report_service.get_inventory_report(session)


@router.get(
    "/stock-movements",
    response_model=StockMovementReportResponse,
)
async def get_stock_movement_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> StockMovementReportResponse:
    return await report_service.get_stock_movement_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/financial",
    response_model=FinancialReportResponse,
)
async def get_financial_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> FinancialReportResponse:
    return await report_service.get_financial_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/customers",
    response_model=CustomerReportResponse,
)
async def get_customer_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> CustomerReportResponse:
    return await report_service.get_customer_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

@router.get(
    "/purchases",
    response_model=PurchaseReportResponse,
)
async def get_purchase_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> PurchaseReportResponse:
    return await report_service.get_purchase_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/suppliers",
    response_model=SupplierReportResponse,
)
async def get_supplier_report(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> SupplierReportResponse:
    return await report_service.get_supplier_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )