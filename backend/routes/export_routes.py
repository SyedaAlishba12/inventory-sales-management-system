from __future__ import annotations

from datetime import date
from io import BytesIO
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from models.sale import PaymentMethod, SaleStatus
from services.export_service import export_service
from services.report_service import report_service


router = APIRouter(
    prefix="/api/reports/exports",
    tags=["Report Exports"],
)


DatabaseSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


def _file_response(
    file: BytesIO,
    filename: str,
    media_type: str,
) -> StreamingResponse:
    return StreamingResponse(
        file,
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )


# ============================================================
# Sales Excel
# ============================================================

@router.get("/sales/excel")
async def export_sales_excel(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    payment_method: Optional[PaymentMethod] = Query(None),
    status: Optional[SaleStatus] = Query(None),
):
    report = await report_service.get_sales_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
        payment_method=payment_method,
        status=status,
    )

    file = export_service.sales_excel(report)

    return _file_response(
        file,
        "sales_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Inventory Excel
# ============================================================

@router.get("/inventory/excel")
async def export_inventory_excel(
    session: DatabaseSession,
):
    report = await report_service.get_inventory_report(
        session
    )

    file = export_service.inventory_excel(report)

    return _file_response(
        file,
        "inventory_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Customer Excel
# ============================================================

@router.get("/customers/excel")
async def export_customers_excel(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    report = await report_service.get_customer_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

    file = export_service.customer_excel(report)

    return _file_response(
        file,
        "customer_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Supplier Excel
# ============================================================

@router.get("/suppliers/excel")
async def export_suppliers_excel(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    report = await report_service.get_supplier_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

    file = export_service.supplier_excel(report)

    return _file_response(
        file,
        "supplier_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Product Excel
# ============================================================

@router.get("/products/excel")
async def export_products_excel(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    report = await report_service.get_product_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

    file = export_service.product_excel(report)

    return _file_response(
        file,
        "product_sales_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Purchase Excel
# ============================================================

@router.get("/purchases/excel")
async def export_purchases_excel(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    report = await report_service.get_purchase_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

    file = export_service.purchase_excel(report)

    return _file_response(
        file,
        "purchase_report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ============================================================
# Sales PDF
# ============================================================

@router.get("/sales/pdf")
async def export_sales_pdf(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    payment_method: Optional[PaymentMethod] = Query(None),
    status: Optional[SaleStatus] = Query(None),
):
    report = await report_service.get_sales_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
        payment_method=payment_method,
        status=status,
    )

    file = export_service.sales_pdf(report)

    return _file_response(
        file,
        "sales_report.pdf",
        "application/pdf",
    )


# ============================================================
# Monthly Business Report PDF
# ============================================================

@router.get("/monthly-business/pdf")
async def export_monthly_business_report_pdf(
    session: DatabaseSession,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    report = await report_service.get_monthly_business_report(
        session=session,
        start_date=start_date,
        end_date=end_date,
    )

    file = export_service.monthly_business_report_pdf(
        report
    )

    return _file_response(
        file,
        "monthly_business_report.pdf",
        "application/pdf",
    )