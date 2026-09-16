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
from services.inventory_service import InventoryService
from services.pos_service import calculate_totals


async def _decrease_stock(
    session: AsyncSession, *, product_id: uuid.UUID, quantity: int, user_id: uuid.UUID
) -> None:
    """Wired to Zainab's real InventoryService.process_stock_out.

    NOTE for the team: process_stock_out() commits the session itself
    internally. Inside our checkout loop, that means if item 2 of a
    multi-item cart fails (e.g. insufficient stock), item 1's stock
    decrease + our partially-built Sale row are already permanently
    committed — not rolled back. Flagging this to Zainab/Taha since
    Purchase's process_stock_in() likely has the same behavior. Not
    something to silently patch here since it's not our file.
    """
    await InventoryService.process_stock_out(
        session,
        product_id=product_id,
        quantity=quantity,
        user_id=user_id,
        reason="Sale Completed",
    )


# TODO: swap in a real notification_service.create(...) if Zainab adds one
# later — her NotificationService currently only has read/mark-as-read
# methods, no create(). Matching her own pattern from inventory_service.py,
# which builds a Notification(...) row directly rather than going through
# a service method.
async def _notify_new_sale(session: AsyncSession, *, sale: Sale) -> None:
    from models.notification import Notification

    session.add(
        Notification(
            user_id=None,  # broadcast — visible to all, not tied to one staff member
            product_id=None,  # a sale can span multiple products, doesn't fit one FK
            title="New Sale",
            message=f"New sale completed: Invoice {sale.invoice_number} (total {sale.total}).",
            type="NEW_SALE",
            is_read=False,
        )
    )


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
            await _decrease_stock(
                session, product_id=item.product_id, quantity=item.quantity, user_id=user_id
            )

        await activity_log_service.log(
            session,
            action="SALE_CREATED",
            user_id=user_id,
            entity_type="Sale",
            entity_id=sale.id,
            description=f"Staff created Sale #{sale.invoice_number}",
        )

        # "New sale" notification — per the task doc, the module that
        # experiences the event (us) triggers it, not Zainab's module.
        await _notify_new_sale(session, sale=sale)

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


    async def checkout(
        self,
        session: AsyncSession,
        *,
        user_id,
        payload: SaleCreate,
    ) -> Sale:
        """Wraps complete_sale with commit/rollback so both /api/pos/checkout
        and POST /api/sales (two separate route files) share one code path."""
        try:
            sale = await self.complete_sale(session, user_id=user_id, payload=payload)
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        return sale


sales_service = SalesService()
