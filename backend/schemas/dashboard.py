from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DashboardStats(BaseModel):
    total_sales: Decimal
    todays_sales: Decimal
    total_products: int
    low_stock_products: int
    total_customers: int
    pending_orders: int
    monthly_revenue: Decimal


class DailySalesPoint(BaseModel):
    date: date
    sales: Decimal


class MonthlySalesPoint(BaseModel):
    month: str
    sales: Decimal


class TopProductPoint(BaseModel):
    product_id: UUID
    product_name: str
    quantity_sold: int
    revenue: Decimal


class CategoryRevenuePoint(BaseModel):
    category_id: UUID
    category_name: str
    revenue: Decimal


class LowStockItem(BaseModel):
    product_id: UUID
    product_name: str
    sku: str
    current_stock: int
    min_stock_level: int


class RecentSale(BaseModel):
    id: UUID
    invoice_number: str
    customer_name: str
    total: Decimal
    payment_method: str
    status: str
    sale_date: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    stats: DashboardStats
    daily_sales: list[DailySalesPoint]
    monthly_sales: list[MonthlySalesPoint]
    top_products: list[TopProductPoint]
    category_revenue: list[CategoryRevenuePoint]
    low_stock_items: list[LowStockItem]
    recent_sales: list[RecentSale]