from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import Date, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.category import Category
from models.customer import Customer
from models.inventory import Inventory
from models.product import Product
from models.purchase import Purchase, PurchaseStatus
from models.sale import Sale, SaleStatus
from models.sale_item import SaleItem
from schemas.dashboard import (
    CategoryRevenuePoint,
    DailySalesPoint,
    DashboardResponse,
    DashboardStats,
    LowStockItem,
    MonthlySalesPoint,
    RecentSale,
    TopProductPoint,
)


class DashboardService:
    """Read-only aggregation service for the business dashboard."""

    @staticmethod
    def _completed_sales_filter():
        return Sale.status == SaleStatus.COMPLETED

    async def get_dashboard(
        self,
        session: AsyncSession,
    ) -> DashboardResponse:
        now = datetime.now(timezone.utc)

        # ---------------------------------------------------------
        # Date boundaries
        # ---------------------------------------------------------
        today_start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        tomorrow_start = today_start + timedelta(days=1)

        month_start = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        seven_days_ago = today_start - timedelta(days=6)

        # ---------------------------------------------------------
        # KPI 1: Total Sales
        # ---------------------------------------------------------
        total_sales_stmt = select(
            func.coalesce(func.sum(Sale.total), 0)
        ).where(
            self._completed_sales_filter()
        )

        total_sales = Decimal(
            str((await session.execute(total_sales_stmt)).scalar_one())
        )

        # ---------------------------------------------------------
        # KPI 2: Today's Sales
        # ---------------------------------------------------------
        todays_sales_stmt = select(
            func.coalesce(func.sum(Sale.total), 0)
        ).where(
            self._completed_sales_filter(),
            Sale.sale_date >= today_start,
            Sale.sale_date < tomorrow_start,
        )

        todays_sales = Decimal(
            str((await session.execute(todays_sales_stmt)).scalar_one())
        )

        # ---------------------------------------------------------
        # KPI 3: Total Products
        # ---------------------------------------------------------
        total_products_stmt = select(
            func.count(Product.id)
        )

        total_products = int(
            (await session.execute(total_products_stmt)).scalar_one()
        )

        # ---------------------------------------------------------
        # KPI 4: Low Stock Products
        #
        # current_stock <= min_stock_level
        # ---------------------------------------------------------
        low_stock_count_stmt = (
            select(func.count(Product.id))
            .join(
                Inventory,
                Inventory.product_id == Product.id,
            )
            .where(
                Inventory.current_stock <= Product.min_stock_level
            )
        )

        low_stock_products = int(
            (await session.execute(low_stock_count_stmt)).scalar_one()
        )

        # ---------------------------------------------------------
        # KPI 5: Total Customers
        # ---------------------------------------------------------
        total_customers_stmt = select(
            func.count(Customer.id)
        )

        total_customers = int(
            (await session.execute(total_customers_stmt)).scalar_one()
        )

        # ---------------------------------------------------------
        # KPI 6: Pending Orders
        #
        # Pending Orders = pending purchases according to the
        # project's agreed business rule.
        # ---------------------------------------------------------
        pending_orders_stmt = select(
            func.count(Purchase.id)
        ).where(
            Purchase.purchase_status == PurchaseStatus.PENDING
        )

        pending_orders = int(
            (await session.execute(pending_orders_stmt)).scalar_one()
        )

        # ---------------------------------------------------------
        # KPI 7: Monthly Revenue
        # ---------------------------------------------------------
        monthly_revenue_stmt = select(
            func.coalesce(func.sum(Sale.total), 0)
        ).where(
            self._completed_sales_filter(),
            Sale.sale_date >= month_start,
            Sale.sale_date <= now,
        )

        monthly_revenue = Decimal(
            str((await session.execute(monthly_revenue_stmt)).scalar_one())
        )

        # ---------------------------------------------------------
        # Daily Sales - last 7 days
        # ---------------------------------------------------------
        daily_sales_stmt = (
            select(
                cast(Sale.sale_date, Date).label("sale_day"),
                func.coalesce(func.sum(Sale.total), 0).label("sales"),
            )
            .where(
                self._completed_sales_filter(),
                Sale.sale_date >= seven_days_ago,
                Sale.sale_date < tomorrow_start,
            )
            .group_by(cast(Sale.sale_date, Date))
            .order_by(cast(Sale.sale_date, Date))
        )

        daily_sales_rows = (
            await session.execute(daily_sales_stmt)
        ).all()

        daily_sales_map = {
            row.sale_day: Decimal(str(row.sales))
            for row in daily_sales_rows
        }

        daily_sales: list[DailySalesPoint] = []

        for offset in range(7):
            current_date = (
                seven_days_ago + timedelta(days=offset)
            ).date()

            daily_sales.append(
                DailySalesPoint(
                    date=current_date,
                    sales=daily_sales_map.get(
                        current_date,
                        Decimal("0.00"),
                    ),
                )
            )

        # ---------------------------------------------------------
        # Monthly Sales - last 7 months
        # ---------------------------------------------------------
        monthly_sales_expr = func.date_trunc("month", Sale.sale_date)

        monthly_sales_stmt = (
            select(
                monthly_sales_expr.label("sale_month"),
                func.coalesce(func.sum(Sale.total), 0).label("sales"),
            )
            .where(
                Sale.status == SaleStatus.COMPLETED,
                Sale.sale_date >= month_start - timedelta(days=180),
                Sale.sale_date <= now,
            )
            .group_by(monthly_sales_expr)
            .order_by(monthly_sales_expr)
        )

        monthly_sales_rows = (
            await session.execute(monthly_sales_stmt)
        ).all()

        monthly_sales = [
            MonthlySalesPoint(
                month=row.sale_month.strftime("%b"),
                sales=Decimal(str(row.sales)),
            )
            for row in monthly_sales_rows
        ]

        # ---------------------------------------------------------
        # Top Selling Products - top 5
        # ---------------------------------------------------------
        top_products_stmt = (
            select(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                func.coalesce(
                    func.sum(SaleItem.quantity),
                    0,
                ).label("quantity_sold"),
                func.coalesce(
                    func.sum(SaleItem.line_subtotal),
                    0,
                ).label("revenue"),
            )
            .join(
                SaleItem,
                SaleItem.product_id == Product.id,
            )
            .join(
                Sale,
                Sale.id == SaleItem.sale_id,
            )
            .where(
                self._completed_sales_filter()
            )
            .group_by(
                Product.id,
                Product.name,
            )
            .order_by(
                func.sum(SaleItem.quantity).desc()
            )
            .limit(5)
        )

        top_product_rows = (
            await session.execute(top_products_stmt)
        ).all()

        top_products = [
            TopProductPoint(
                product_id=row.product_id,
                product_name=row.product_name,
                quantity_sold=int(row.quantity_sold),
                revenue=Decimal(str(row.revenue)),
            )
            for row in top_product_rows
        ]

        # ---------------------------------------------------------
        # Revenue by Category - top categories
        # ---------------------------------------------------------
        category_revenue_stmt = (
            select(
                Category.id.label("category_id"),
                Category.name.label("category_name"),
                func.coalesce(
                    func.sum(SaleItem.line_subtotal),
                    0,
                ).label("revenue"),
            )
            .join(
                Product,
                Product.category_id == Category.id,
            )
            .join(
                SaleItem,
                SaleItem.product_id == Product.id,
            )
            .join(
                Sale,
                Sale.id == SaleItem.sale_id,
            )
            .where(
                self._completed_sales_filter()
            )
            .group_by(
                Category.id,
                Category.name,
            )
            .order_by(
                func.sum(SaleItem.line_subtotal).desc()
            )
        )

        category_rows = (
            await session.execute(category_revenue_stmt)
        ).all()

        category_revenue = [
            CategoryRevenuePoint(
                category_id=row.category_id,
                category_name=row.category_name,
                revenue=Decimal(str(row.revenue)),
            )
            for row in category_rows
        ]

        # ---------------------------------------------------------
        # Low Stock Products - top 5 alerts
        # ---------------------------------------------------------
        low_stock_stmt = (
            select(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                Product.sku.label("sku"),
                Inventory.current_stock.label("current_stock"),
                Product.min_stock_level.label("min_stock_level"),
            )
            .join(
                Inventory,
                Inventory.product_id == Product.id,
            )
            .where(
                Inventory.current_stock <= Product.min_stock_level
            )
            .order_by(
                Inventory.current_stock.asc(),
                Product.name.asc(),
            )
            .limit(5)
        )

        low_stock_rows = (
            await session.execute(low_stock_stmt)
        ).all()

        low_stock_items = [
            LowStockItem(
                product_id=row.product_id,
                product_name=row.product_name,
                sku=row.sku,
                current_stock=int(row.current_stock),
                min_stock_level=int(row.min_stock_level),
            )
            for row in low_stock_rows
        ]

        # ---------------------------------------------------------
        # Recent Sales - latest 5 completed sales
        # ---------------------------------------------------------
        recent_sales_stmt = (
            select(
                Sale.id,
                Sale.invoice_number,
                Sale.total,
                Sale.payment_method,
                Sale.status,
                Sale.sale_date,
                Customer.name.label("customer_name"),
            )
            .outerjoin(
                Customer,
                Customer.id == Sale.customer_id,
            )
            .where(
                self._completed_sales_filter()
            )
            .order_by(
                Sale.sale_date.desc(),
                Sale.id.desc(),
            )
            .limit(5)
        )

        recent_sales_rows = (
            await session.execute(recent_sales_stmt)
        ).all()

        recent_sales = [
            RecentSale(
                id=row.id,
                invoice_number=row.invoice_number,
                customer_name=row.customer_name or "Walk-in Customer",
                total=Decimal(str(row.total)),
                payment_method=row.payment_method.value,
                status=row.status.value,
                sale_date=row.sale_date,
            )
            for row in recent_sales_rows
        ]

        # ---------------------------------------------------------
        # Final response
        # ---------------------------------------------------------
        return DashboardResponse(
            stats=DashboardStats(
                total_sales=total_sales,
                todays_sales=todays_sales,
                total_products=total_products,
                low_stock_products=low_stock_products,
                total_customers=total_customers,
                pending_orders=pending_orders,
                monthly_revenue=monthly_revenue,
            ),
            daily_sales=daily_sales,
            monthly_sales=monthly_sales,
            top_products=top_products,
            category_revenue=category_revenue,
            low_stock_items=low_stock_items,
            recent_sales=recent_sales,
        )


dashboard_service = DashboardService()