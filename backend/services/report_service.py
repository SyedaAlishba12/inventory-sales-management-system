from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.customer import Customer
from models.inventory import Inventory
from models.inventory_movement import InventoryMovement
from models.product import Product
from models.purchase import PaymentStatus, Purchase
from models.sale import PaymentMethod, Sale, SaleStatus
from models.sale_item import SaleItem
from models.supplier import Supplier
from schemas.report import (
    CustomerReportResponse,
    CustomerReportRow,
    FinancialReportResponse,
    FinancialReportSummary,
    InventoryReportResponse,
    InventoryReportRow,
    MonthlyBusinessReportResponse,
    MonthlyBusinessReportSummary,
    ProductReportResponse,
    ProductSalesRow,
    PurchaseReportResponse,
    PurchaseReportRow,
    SalesReportResponse,
    SalesReportRow,
    SalesReportSummary,
    StockMovementReportResponse,
    StockMovementReportRow,
    SupplierReportResponse,
    SupplierReportRow,
)


class ReportService:
    """Read-only service for generating business reports."""

    @staticmethod
    def _date_filters(
        column,
        start_date: Optional[date],
        end_date: Optional[date],
    ) -> list:
        filters = []

        if start_date is not None:
            start_datetime = datetime.combine(
                start_date,
                time.min,
                tzinfo=timezone.utc,
            )
            filters.append(column >= start_datetime)

        if end_date is not None:
            end_datetime = datetime.combine(
                end_date,
                time.max,
                tzinfo=timezone.utc,
            )
            filters.append(column <= end_datetime)

        return filters

    async def get_sales_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        payment_method: Optional[PaymentMethod] = None,
        status: Optional[SaleStatus] = None,
    ) -> SalesReportResponse:

        filters = self._date_filters(
            Sale.sale_date,
            start_date,
            end_date,
        )

        if payment_method is not None:
            filters.append(
                Sale.payment_method == payment_method
            )

        if status is not None:
            filters.append(
                Sale.status == status
            )

        summary_stmt = select(
            func.coalesce(
                func.sum(Sale.total),
                0,
            ).label("total_sales"),
            func.count(Sale.id).label("total_transactions"),
            func.coalesce(
                func.avg(Sale.total),
                0,
            ).label("average_sale"),
        ).where(*filters)

        summary_result = await session.execute(summary_stmt)
        summary = summary_result.one()

        customer_name = func.coalesce(
            Customer.name,
            "Walk-in Customer",
        )

        rows_stmt = (
            select(
                Sale.id,
                Sale.invoice_number,
                customer_name.label("customer_name"),
                Sale.sale_date,
                Sale.payment_method,
                Sale.status,
                Sale.subtotal,
                Sale.discount,
                Sale.tax,
                Sale.total,
            )
            .outerjoin(
                Customer,
                Sale.customer_id == Customer.id,
            )
            .where(*filters)
            .order_by(Sale.sale_date.desc())
        )

        rows_result = await session.execute(rows_stmt)

        rows = [
            SalesReportRow(
                id=row.id,
                invoice_number=row.invoice_number,
                customer_name=row.customer_name,
                sale_date=row.sale_date,
                payment_method=row.payment_method.value,
                status=row.status.value,
                subtotal=row.subtotal,
                discount=row.discount,
                tax=row.tax,
                total=row.total,
            )
            for row in rows_result.all()
        ]

        return SalesReportResponse(
            summary=SalesReportSummary(
                total_sales=summary.total_sales,
                total_transactions=summary.total_transactions,
                average_sale=summary.average_sale,
            ),
            rows=rows,
        )

    async def get_product_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> ProductReportResponse:

        sale_filters = self._date_filters(
            Sale.sale_date,
            start_date,
            end_date,
        )

        sale_filters.append(
            Sale.status == SaleStatus.COMPLETED
        )

        sale_join_condition = and_(
            Sale.id == SaleItem.sale_id,
            *sale_filters,
        )

        stmt = (
            select(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                Product.sku,
                func.coalesce(
                    func.sum(SaleItem.quantity),
                    0,
                ).label("quantity_sold"),
                func.coalesce(
                    func.sum(SaleItem.line_subtotal),
                    0,
                ).label("revenue"),
            )
            .outerjoin(
                SaleItem,
                SaleItem.product_id == Product.id,
            )
            .outerjoin(
                Sale,
                sale_join_condition,
            )
            .group_by(
                Product.id,
                Product.name,
                Product.sku,
            )
            .order_by(
                func.coalesce(
                    func.sum(SaleItem.quantity),
                    0,
                ).desc(),
                Product.name,
            )
        )

        result = await session.execute(stmt)

        rows = [
            ProductSalesRow(
                product_id=row.product_id,
                product_name=row.product_name,
                sku=row.sku,
                quantity_sold=row.quantity_sold,
                revenue=row.revenue,
            )
            for row in result.all()
        ]

        return ProductReportResponse(rows=rows)

    async def get_inventory_report(
        self,
        session: AsyncSession,
    ) -> InventoryReportResponse:

        stmt = (
            select(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                Product.sku,
                Inventory.current_stock,
                Inventory.opening_stock,
                Inventory.damaged_stock,
                Product.min_stock_level,
            )
            .join(
                Inventory,
                Inventory.product_id == Product.id,
            )
            .order_by(Product.name)
        )

        result = await session.execute(stmt)

        rows = [
            InventoryReportRow(
                product_id=row.product_id,
                product_name=row.product_name,
                sku=row.sku,
                current_stock=row.current_stock,
                opening_stock=row.opening_stock,
                damaged_stock=row.damaged_stock,
                min_stock_level=row.min_stock_level,
            )
            for row in result.all()
        ]

        return InventoryReportResponse(rows=rows)

    async def get_stock_movement_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> StockMovementReportResponse:

        filters = self._date_filters(
            InventoryMovement.created_at,
            start_date,
            end_date,
        )

        stmt = (
            select(
                InventoryMovement.id,
                InventoryMovement.product_id,
                Product.name.label("product_name"),
                InventoryMovement.movement_type,
                InventoryMovement.quantity,
                InventoryMovement.previous_stock,
                InventoryMovement.new_stock,
                InventoryMovement.reason,
                InventoryMovement.created_at,
            )
            .join(
                Product,
                Product.id == InventoryMovement.product_id,
            )
            .where(*filters)
            .order_by(
                InventoryMovement.created_at.desc()
            )
        )

        result = await session.execute(stmt)

        rows = [
            StockMovementReportRow(
                id=row.id,
                product_id=row.product_id,
                product_name=row.product_name,
                movement_type=row.movement_type.value,
                quantity=row.quantity,
                previous_stock=row.previous_stock,
                new_stock=row.new_stock,
                reason=row.reason,
                created_at=row.created_at,
            )
            for row in result.all()
        ]

        return StockMovementReportResponse(rows=rows)

    async def get_financial_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> FinancialReportResponse:

        sale_filters = self._date_filters(
            Sale.sale_date,
            start_date,
            end_date,
        )

        sale_filters.append(
            Sale.status == SaleStatus.COMPLETED
        )

        revenue_stmt = select(
            func.coalesce(
                func.sum(Sale.total),
                0,
            )
        ).where(*sale_filters)

        revenue_result = await session.execute(revenue_stmt)
        revenue = revenue_result.scalar_one()

        cost_filters = self._date_filters(
            Sale.sale_date,
            start_date,
            end_date,
        )

        cost_filters.append(
            Sale.status == SaleStatus.COMPLETED
        )

        cost_stmt = (
            select(
                func.coalesce(
                    func.sum(
                        SaleItem.quantity
                        * Product.cost_price
                    ),
                    0,
                )
            )
            .join(
                Sale,
                Sale.id == SaleItem.sale_id,
            )
            .join(
                Product,
                Product.id == SaleItem.product_id,
            )
            .where(*cost_filters)
        )

        cost_result = await session.execute(cost_stmt)
        cost = cost_result.scalar_one()

        profit = revenue - cost

        return FinancialReportResponse(
            summary=FinancialReportSummary(
                revenue=revenue,
                cost=cost,
                profit=profit,
            )
        )

    async def get_customer_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> CustomerReportResponse:

        sale_filters = self._date_filters(
            Sale.sale_date,
            start_date,
            end_date,
        )

        sale_filters.append(
            Sale.status == SaleStatus.COMPLETED
        )

        customer_sale_join_condition = and_(
            Sale.customer_id == Customer.id,
            *sale_filters,
        )

        stmt = (
            select(
                Customer.id.label("customer_id"),
                Customer.name.label("customer_name"),
                Customer.phone,
                Customer.email,
                func.count(Sale.id).label(
                    "total_purchases"
                ),
                func.coalesce(
                    func.sum(Sale.total),
                    0,
                ).label("total_spending"),
            )
            .outerjoin(
                Sale,
                customer_sale_join_condition,
            )
            .group_by(
                Customer.id,
                Customer.name,
                Customer.phone,
                Customer.email,
            )
            .order_by(
                func.coalesce(
                    func.sum(Sale.total),
                    0,
                ).desc(),
                Customer.name,
            )
        )

        result = await session.execute(stmt)

        rows = [
            CustomerReportRow(
                customer_id=row.customer_id,
                customer_name=row.customer_name,
                phone=row.phone,
                email=row.email,
                total_purchases=row.total_purchases,
                total_spending=row.total_spending,
            )
            for row in result.all()
        ]

        return CustomerReportResponse(rows=rows)

    async def get_supplier_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> SupplierReportResponse:

        filters = self._date_filters(
            Purchase.purchase_date,
            start_date,
            end_date,
        )

        stmt = (
            select(
                Supplier.id.label("supplier_id"),
                Supplier.name.label("supplier_name"),
                func.count(Purchase.id).label(
                    "total_purchases"
                ),
                func.coalesce(
                    func.sum(Purchase.total_cost),
                    0,
                ).label("total_purchase_amount"),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Purchase.payment_status
                                != PaymentStatus.PAID,
                                Purchase.total_cost,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("pending_amount"),
            )
            .outerjoin(
                Purchase,
                Purchase.supplier_id == Supplier.id,
            )
            .where(*filters)
            .group_by(
                Supplier.id,
                Supplier.name,
            )
            .order_by(Supplier.name)
        )

        result = await session.execute(stmt)

        rows = [
            SupplierReportRow(
                supplier_id=row.supplier_id,
                supplier_name=row.supplier_name,
                total_purchases=row.total_purchases,
                total_purchase_amount=row.total_purchase_amount,
                pending_amount=row.pending_amount,
            )
            for row in result.all()
        ]

        return SupplierReportResponse(rows=rows)

    async def get_purchase_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> PurchaseReportResponse:

        filters = self._date_filters(
            Purchase.purchase_date,
            start_date,
            end_date,
        )

        stmt = (
            select(
                Purchase.id.label("purchase_id"),
                Supplier.name.label("supplier_name"),
                Purchase.purchase_date,
                Purchase.payment_status,
                Purchase.purchase_status,
                Purchase.total_cost,
                Purchase.notes,
            )
            .join(
                Supplier,
                Supplier.id == Purchase.supplier_id,
            )
            .where(*filters)
            .order_by(
                Purchase.purchase_date.desc()
            )
        )

        result = await session.execute(stmt)

        rows = [
            PurchaseReportRow(
                purchase_id=row.purchase_id,
                supplier_name=row.supplier_name,
                purchase_date=row.purchase_date,
                payment_status=row.payment_status.value,
                purchase_status=row.purchase_status.value,
                total_cost=row.total_cost,
                notes=row.notes,
            )
            for row in result.all()
        ]

        return PurchaseReportResponse(rows=rows)

    async def get_monthly_business_report(
        self,
        session: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> MonthlyBusinessReportResponse:
        """
        Generate a management-level business summary.

        If dates are not supplied, the report defaults to the
        current calendar month.
        """

        if start_date is None and end_date is None:
            today = date.today()
            start_date = today.replace(day=1)
            end_date = today

        elif start_date is None:
            start_date = end_date.replace(day=1)

        elif end_date is None:
            end_date = start_date

        sales_report = await self.get_sales_report(
            session=session,
            start_date=start_date,
            end_date=end_date,
            status=SaleStatus.COMPLETED,
        )

        financial_report = await self.get_financial_report(
            session=session,
            start_date=start_date,
            end_date=end_date,
        )

        purchase_report = await self.get_purchase_report(
            session=session,
            start_date=start_date,
            end_date=end_date,
        )

        inventory_report = await self.get_inventory_report(
            session=session,
        )

        total_purchases = sum(
            (
                row.total_cost
                for row in purchase_report.rows
            ),
            Decimal("0"),
        )

        low_stock_products = sum(
            1
            for row in inventory_report.rows
            if row.current_stock <= row.min_stock_level
        )

        summary = MonthlyBusinessReportSummary(
            start_date=start_date,
            end_date=end_date,
            total_sales=sales_report.summary.total_sales,
            total_transactions=(
                sales_report.summary.total_transactions
            ),
            average_sale=sales_report.summary.average_sale,
            revenue=financial_report.summary.revenue,
            cost=financial_report.summary.cost,
            profit=financial_report.summary.profit,
            total_purchases=total_purchases,
            total_products=len(inventory_report.rows),
            low_stock_products=low_stock_products,
        )

        return MonthlyBusinessReportResponse(
            summary=summary,
        )


report_service = ReportService()