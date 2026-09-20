from sqlalchemy.ext.asyncio import AsyncSession

from schemas.inventory_schema import InventoryAdjustmentCreate
from services.inventory_service import InventoryService


class InventoryController:

    @staticmethod
    async def get_all_inventory_records(
        db: AsyncSession,
    ):
        return await InventoryService.get_all_inventory(db)

    @staticmethod
    async def get_all_movements(
        db: AsyncSession,
    ):
        return await InventoryService.get_inventory_movements(db)

    @staticmethod
    async def get_low_stock_items(
        db: AsyncSession,
    ):
        return await InventoryService.get_low_stock_products(db)

    @staticmethod
    async def adjust_product_stock(
        db: AsyncSession,
        adjustment: InventoryAdjustmentCreate,
        user_id,
    ):
        return await InventoryService.adjust_stock(
            db=db,
            product_id=adjustment.product_id,
            quantity=adjustment.quantity,
            movement_type=adjustment.movement_type,
            user_id=user_id,
            reason=adjustment.reason,
        )