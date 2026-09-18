from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# Common
# ============================================================

class ReportDateRange(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None


# ============================================================
# Sales Reports
# ============================================================

class SalesReportSummary(BaseModel):
    total_sales: Decimal
    total_transactions: int
    average_sale: Decimal


class SalesReportRow(BaseModel):
    id: UUID
    invoice_number: str
    customer_name: str
    sale_date: datetime
    payment_method: str
    status: str
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal

    model_config = ConfigDict(from_attributes=True)


class SalesReportResponse(BaseModel):
    summary: SalesReportSummary
    rows: list[SalesReportRow]


# ============================================================
# Product Reports
# ============================================================

class ProductSalesRow(BaseModel):
    product_id: UUID
    product_name: str
    sku: str
    quantity_sold: int
    revenue: Decimal


class ProductReportResponse(BaseModel):
    rows: list[ProductSalesRow]


# ============================================================
# Inventory Reports
# ============================================================

class InventoryReportRow(BaseModel):
    product_id: UUID
    product_name: str
    sku: str
    current_stock: int
    opening_stock: int
    damaged_stock: int
    min_stock_level: int


class InventoryReportResponse(BaseModel):
    rows: list[InventoryReportRow]


class StockMovementReportRow(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    movement_type: str
    quantity: int
    previous_stock: int
    new_stock: int
    reason: Optional[str] = None
    created_at: datetime


class StockMovementReportResponse(BaseModel):
    rows: list[StockMovementReportRow]


# ============================================================
# Financial Reports
# ============================================================

class FinancialReportSummary(BaseModel):
    revenue: Decimal
    cost: Decimal
    profit: Decimal


class FinancialReportResponse(BaseModel):
    summary: FinancialReportSummary


# ============================================================
# Customer Reports
# ============================================================

class CustomerReportRow(BaseModel):
    customer_id: UUID
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    total_purchases: int
    total_spending: Decimal


class CustomerReportResponse(BaseModel):
    rows: list[CustomerReportRow]


# ============================================================
# Supplier Reports
# ============================================================

class SupplierReportRow(BaseModel):
    supplier_id: UUID
    supplier_name: str
    total_purchases: int
    total_purchase_amount: Decimal
    pending_amount: Decimal


class SupplierReportResponse(BaseModel):
    rows: list[SupplierReportRow]


# ============================================================
# Purchase Reports
# ============================================================

class PurchaseReportRow(BaseModel):
    purchase_id: UUID
    supplier_name: str
    purchase_date: datetime
    payment_status: str
    purchase_status: str
    total_cost: Decimal
    notes: Optional[str] = None


class PurchaseReportResponse(BaseModel):
    rows: list[PurchaseReportRow]


# ============================================================
# Monthly Business Report
# ============================================================

class MonthlyBusinessReportSummary(BaseModel):
    start_date: date
    end_date: date
    total_sales: Decimal
    total_transactions: int
    average_sale: Decimal
    revenue: Decimal
    cost: Decimal
    profit: Decimal
    total_purchases: Decimal
    total_products: int
    low_stock_products: int


class MonthlyBusinessReportResponse(BaseModel):
    summary: MonthlyBusinessReportSummary