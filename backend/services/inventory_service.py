from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.inventory import Inventory
from models.inventory_movement import InventoryMovement, MovementType
from models.notification import Notification, NotificationType
from models.product import Product


class InventoryService:

    @staticmethod
    async def get_all_inventory(
        db: AsyncSession,
    ) -> list[Inventory]:
        result = await db.execute(
            select(Inventory).order_by(Inventory.created_at.desc())
        )

        return list(result.scalars().all())

    @staticmethod
    async def get_inventory_movements(
        db: AsyncSession,
    ) -> list[InventoryMovement]:
        result = await db.execute(
            select(InventoryMovement).order_by(
                InventoryMovement.created_at.desc()
            )
        )

        return list(result.scalars().all())

    @staticmethod
    async def get_low_stock_products(
        db: AsyncSession,
    ) -> list[Inventory]:
        result = await db.execute(
            select(Inventory)
            .join(Product, Product.id == Inventory.product_id)
            .where(
                Inventory.current_stock <= Product.min_stock_level
            )
            .order_by(Inventory.current_stock.asc())
        )

        return list(result.scalars().all())

    @staticmethod
    async def _get_product(
        db: AsyncSession,
        product_id,
    ) -> Product:
        product = await db.get(Product, product_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        return product

    @staticmethod
    async def _get_inventory(
        db: AsyncSession,
        product_id,
        lock: bool = False,
    ) -> Inventory:
        query = select(Inventory).where(
            Inventory.product_id == product_id
        )

        # Locks the inventory row until the current transaction
        # is committed or rolled back.
        if lock:
            query = query.with_for_update()

        result = await db.execute(query)
        inventory = result.scalar_one_or_none()

        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory record not found for this product.",
            )

        return inventory

    @staticmethod
    async def _create_low_stock_notification(
        db: AsyncSession,
        product: Product,
        current_stock: int,
    ) -> None:
        """
        Creates a low-stock notification only if the product
        is currently at/below its minimum stock level and there
        is no existing unread low-stock notification for it.

        user_id is intentionally left NULL so this can act as
        a system/broadcast notification.
        """

        if current_stock > product.min_stock_level:
            return

        existing_result = await db.execute(
            select(Notification)
            .where(
                Notification.product_id == product.id,
                Notification.type == NotificationType.LOW_STOCK,
                Notification.is_read.is_(False),
            )
            .limit(1)
        )

        existing_notification = existing_result.scalar_one_or_none()

        if existing_notification:
            return

        notification = Notification(
            user_id=None,
            product_id=product.id,
            title="Low Stock Alert",
            message=(
                f"{product.name} is low in stock. "
                f"Current stock: {current_stock}. "
                f"Minimum stock level: {product.min_stock_level}."
            ),
            type=NotificationType.LOW_STOCK,
            is_read=False,
        )

        db.add(notification)

    @staticmethod
    async def process_stock_in(
        db: AsyncSession,
        product_id,
        quantity: int,
        user_id,
        reason: str = "Purchase Received",
    ) -> Inventory:

        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock-in quantity must be greater than zero.",
            )

        product = await InventoryService._get_product(
            db,
            product_id,
        )

        inventory = await InventoryService._get_inventory(
            db,
            product_id,
            lock=True,
        )

        previous_stock = inventory.current_stock
        new_stock = previous_stock + quantity

        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type=MovementType.STOCK_IN,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason,
        )

        db.add(movement)

        await InventoryService._create_low_stock_notification(
            db,
            product,
            new_stock,
        )

        # IMPORTANT:
        # No commit here.
        # The caller controls the transaction.

        return inventory

    @staticmethod
    async def process_stock_out(
        db: AsyncSession,
        product_id,
        quantity: int,
        user_id,
        reason: str = "Sale Completed",
    ) -> Inventory:

        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock-out quantity must be greater than zero.",
            )

        product = await InventoryService._get_product(
            db,
            product_id,
        )

        inventory = await InventoryService._get_inventory(
            db,
            product_id,
            lock=True,
        )

        previous_stock = inventory.current_stock

        if quantity > previous_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available stock: {previous_stock}, "
                    f"requested: {quantity}."
                ),
            )

        new_stock = previous_stock - quantity

        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type=MovementType.STOCK_OUT,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason,
        )

        db.add(movement)

        await InventoryService._create_low_stock_notification(
            db,
            product,
            new_stock,
        )

        # IMPORTANT:
        # No commit here.
        # The caller controls the transaction.

        return inventory

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        product_id,
        quantity: int,
        movement_type: MovementType,
        user_id,
        reason: str | None = None,
    ) -> Inventory:

        product = await InventoryService._get_product(
            db,
            product_id,
        )

        inventory = await InventoryService._get_inventory(
            db,
            product_id,
            lock=True,
        )

        previous_stock = inventory.current_stock

        # --------------------------------------------------
        # STOCK IN
        # --------------------------------------------------
        if movement_type == MovementType.STOCK_IN:

            if quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stock-in quantity must be greater than zero.",
                )

            new_stock = previous_stock + quantity

        # --------------------------------------------------
        # STOCK OUT
        # --------------------------------------------------
        elif movement_type == MovementType.STOCK_OUT:

            if quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stock-out quantity must be greater than zero.",
                )

            if quantity > previous_stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock. "
                        f"Available stock: {previous_stock}, "
                        f"requested: {quantity}."
                    ),
                )

            new_stock = previous_stock - quantity

        # --------------------------------------------------
        # DAMAGED
        # --------------------------------------------------
        elif movement_type == MovementType.DAMAGED:

            if quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Damaged quantity must be greater than zero.",
                )

            if quantity > previous_stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot mark more damaged stock than available. "
                        f"Available stock: {previous_stock}."
                    ),
                )

            new_stock = previous_stock - quantity
            inventory.damaged_stock += quantity

        # --------------------------------------------------
        # ADJUSTMENT
        # --------------------------------------------------
        elif movement_type == MovementType.ADJUSTMENT:

            if quantity < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Adjusted stock cannot be negative.",
                )

            # For ADJUSTMENT, quantity means the TARGET stock.
            new_stock = quantity

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid inventory movement type.",
            )

        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason,
        )

        db.add(movement)

        await InventoryService._create_low_stock_notification(
            db,
            product,
            new_stock,
        )

        # IMPORTANT:
        # No commit/refresh here.
        # The route or parent transaction handles it.

        return inventory