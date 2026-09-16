from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from services.inventory_service import InventoryService
from schemas.inventory_schema import InventoryAdjustmentCreate

class InventoryController:
    """Controller layer handling business logic orchestration for Inventory and Stock Movements."""

    @staticmethod
    async def get_all_inventory_records(db: AsyncSession):
        """Orchestrate retrieving all inventory stock levels."""
        return await InventoryService.get_all_inventory(db)

    @staticmethod
    async def get_all_movements(db: AsyncSession):
        """Orchestrate retrieving the complete inventory movement audit trail."""
        return await InventoryService.get_inventory_movements(db)

    @staticmethod
    async def get_low_stock_items(db: AsyncSession):
        """Orchestrate retrieving products that are at or below minimum stock levels."""
        return await InventoryService.get_low_stock_products(db)

    @staticmethod
    async def adjust_product_stock(db: AsyncSession, adjustment_in: InventoryAdjustmentCreate, user_id: uuid.UUID):
        """Orchestrate manual stock adjustments or specific movement types."""
        return await InventoryService.adjust_stock(
            db=db,
            product_id=adjustment_in.product_id,
            quantity=adjustment_in.quantity,
            movement_type=adjustment_in.movement_type,
            user_id=user_id,
            reason=adjustment_in.reason
        )