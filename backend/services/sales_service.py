from __future__ import annotations

import uuid
from decimal import Decimal
from math import ceil

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.sale import Sale, SaleStatus
from models.sale_item import SaleItem
from schemas.sale import SaleCreate
from services.activity_log_service import activity_log_service
from services.pos_service import calculate_totals

# TODO: swap in Zainab's real inventory service once her products/inventory
# PR is merged (expects something like inventory_service.record_stock_out(...)).
# Kept as a no-op stub for now so this module doesn't break on import.
async def _decrease_stock(
    session: AsyncSession, *, product_id: uuid.UUID, quantity: int
) -> None:
    return None


class SalesService:
    async def _generate_invoice_number(self, session: AsyncSession) -> str:
        count_stmt = select(func.count()).select_from(Sale)
        total = int((await session.execute(count_stmt)).scalar_one())
        return f"INV-{total + 1:05d}"

    async def complete_sale(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        payload: SaleCreate,
    ) -> Sale:
        """POS checkout -> Sale + SaleItems -> stock decrease -> activity log."""

        subtotal, discount_amount, tax_amount, total, line_subtotals = calculate_totals(
            payload.items,
            discount=payload.discount,
            is_percent_discount=payload.is_percent_discount,
            tax_rate=payload.tax_rate,
        )

        sale = Sale(
            invoice_number=await self._generate_invoice_number(session),
            user_id=user_id,
            customer_id=payload.customer_id,
            subtotal=subtotal,
            discount=discount_amount,
            tax=tax_amount,
            total=total,
            payment_method=payload.payment_method,
            status=SaleStatus.COMPLETED,
        )
        session.add(sale)
        await session.flush()  # assigns sale.id

        for item, line_subtotal in zip(payload.items, line_subtotals, strict=True):
            session.add(
                SaleItem(
                    sale_id=sale.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    item_discount=item.item_discount,
                    line_subtotal=line_subtotal,
                )
            )
            await _decrease_stock(session, product_id=item.product_id, quantity=item.quantity)

        await activity_log_service.log(
            session,
            action="SALE_CREATED",
            user_id=user_id,
            entity_type="Sale",
            entity_id=sale.id,
            description=f"Staff created Sale #{sale.invoice_number}",
        )

        await session.flush()
        await session.refresh(sale, attribute_names=["items"])
        return sale

    async def get_by_id(self, session: AsyncSession, sale_id: uuid.UUID) -> Sale | None:
        stmt = select(Sale).where(Sale.id == sale_id).options(selectinload(Sale.items))
        return (await session.execute(stmt)).scalar_one_or_none()

    async def list(
        self,
        session: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        payment_method: str | None = None,
        status: str | None = None,
    ) -> tuple[list[Sale], int, int]:
        filters = []
        if payment_method:
            filters.append(Sale.payment_method == payment_method)
        if status:
            filters.append(Sale.status == status)

        count_stmt = select(func.count()).select_from(Sale).where(*filters)
        total = int((await session.execute(count_stmt)).scalar_one())

        stmt: Select = (
            select(Sale)
            .where(*filters)
            .options(selectinload(Sale.items))
            .order_by(Sale.sale_date.desc(), Sale.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = list((await session.execute(stmt)).scalars().all())
        return items, total, ceil(total / page_size) if total else 0


sales_service = SalesService()
