"""
backend/services/purchase_service.py
--------------------------------------
Purchase order business logic.

Fully implemented for everything except the inventory-increment step.
That step is explicitly stubbed pending Zainab's inventory service.

Uses:
    models.purchase      — Purchase, PaymentStatus
    models.purchase_item — PurchaseItem
    models.user          — User
    schemas.purchase_schema — PurchaseCreate, PurchaseUpdate

Inventory-increment stub
-------------------------
At the point in create_purchase() where received stock should flow into
the Inventory table, a clearly-marked stub is left:
    # TODO: call Zainab's inventory service once it exists — for each
    # PurchaseItem on this purchase:
    # await inventory_service.increase_stock(
    #     db, product_id=item.product_id, quantity=item.quantity,
    #     reason="purchase", user_id=purchase.user_id,
    # )
    # This must only ever run once per purchase — the status check above
    # is what enforces that. Do not remove or weaken that check.

This is the only remaining non-trivial stub in the purchase module.
"""

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.purchase import Purchase, PaymentStatus, PurchaseStatus
from models.purchase_item import PurchaseItem
from models.supplier import Supplier
from models.user import User
from schemas.purchase_schema import PurchaseCreate, PurchaseUpdate


class PurchaseService:

    # ------------------------------------------------------------------
    # create
    # ------------------------------------------------------------------

    async def create(
        self, db: AsyncSession, current_user: User, payload: PurchaseCreate
    ) -> Purchase:
        """Create a purchase order and its line items.

        Validates:
            - Supplier exists.
            - At least one item is present.

        Computes total_cost from item quantities × cost_prices.

        Computes total_cost from item quantities × cost_prices.

        Raises:
            HTTPException 404: If the supplier is not found.
        """
        # Validate supplier
        supplier = await db.get(Supplier, payload.supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found.",
            )

        # Compute total cost
        total_cost = sum(
            Decimal(str(item.unit_price)) * item.quantity
            for item in payload.items
        )

        # Create the purchase header
        purchase = Purchase(
            supplier_id=payload.supplier_id,
            user_id=current_user.id,
            payment_status=PaymentStatus.PENDING,
            total_cost=total_cost,
            notes=payload.notes,
        )
        db.add(purchase)
        await db.flush()  # obtain purchase.id before creating items

        # Create line items
        for item_in in payload.items:
            item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity,
                cost_price=Decimal(str(item_in.unit_price)),
            )
            db.add(item)

        await db.flush()
        await db.refresh(purchase)
        await db.commit()

        # Re-fetch with items eagerly loaded for the response
        return await self._get_with_items(db, purchase.id)

    # ------------------------------------------------------------------
    # read
    # ------------------------------------------------------------------

    async def get(self, db: AsyncSession, purchase_id: uuid.UUID) -> Purchase:
        """Return a purchase order with its items; raise 404 if not found."""
        purchase = await self._get_with_items(db, purchase_id)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase order not found.",
            )
        return purchase

    async def list_all(self, db: AsyncSession) -> list[Purchase]:
        """Return all purchase orders with items (newest first)."""
        result = await db.execute(
            select(Purchase)
            .options(selectinload(Purchase.items))
            .order_by(Purchase.created_at.desc())
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # update
    # ------------------------------------------------------------------

    async def update(
        self, db: AsyncSession, purchase_id: uuid.UUID, payload: PurchaseUpdate
    ) -> Purchase:
        """Update the status or notes of an existing purchase order.

        Raises:
            HTTPException 404: If the purchase order is not found.
        """
        purchase = await self.get(db, purchase_id)

        if payload.payment_status is not None:
            purchase.payment_status = PaymentStatus(payload.payment_status)
        if payload.notes is not None:
            purchase.notes = payload.notes

        await db.flush()
        await db.commit()

        return await self._get_with_items(db, purchase_id)

    # ------------------------------------------------------------------
    # delete
    # ------------------------------------------------------------------

    async def delete(self, db: AsyncSession, purchase_id: uuid.UUID) -> None:
        """Delete a purchase order (and cascade-delete its items).

        Raises:
            HTTPException 404: If the purchase order is not found.
        """
        purchase = await self.get(db, purchase_id)
        await db.delete(purchase)
        await db.commit()

    # ------------------------------------------------------------------
    # receive
    # ------------------------------------------------------------------

    async def receive_purchase(self, db: AsyncSession, purchase_id: uuid.UUID) -> Purchase:
        purchase = await self.get(db, purchase_id)

        if purchase.purchase_status == PurchaseStatus.RECEIVED:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Purchase has already been received — cannot receive it again.",
            )
        if purchase.purchase_status == PurchaseStatus.CANCELLED:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Cannot receive a cancelled purchase.",
            )

        purchase.purchase_status = PurchaseStatus.RECEIVED
        await db.flush()

        # TODO: call Zainab's inventory service once it exists — for each
        # PurchaseItem on this purchase:
        # await inventory_service.increase_stock(
        #     db, product_id=item.product_id, quantity=item.quantity,
        #     reason="purchase", user_id=purchase.user_id,
        # )
        # This must only ever run once per purchase — the status check above
        # is what enforces that. Do not remove or weaken that check.

        await db.commit()
        await db.refresh(purchase)
        return await self._get_with_items(db, purchase.id)

    # ------------------------------------------------------------------
    # internal helpers
    # ------------------------------------------------------------------

    async def _get_with_items(
        self, db: AsyncSession, purchase_id: uuid.UUID
    ) -> Purchase | None:
        """Fetch a purchase eagerly loading its PurchaseItem collection."""
        result = await db.execute(
            select(Purchase)
            .where(Purchase.id == purchase_id)
            .options(selectinload(Purchase.items))
        )
        return result.scalar_one_or_none()


purchase_service = PurchaseService()
