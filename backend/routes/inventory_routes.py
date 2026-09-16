from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database.session import get_db
from models.inventory import Inventory
from models.inventory_movement import InventoryMovement
from models.product import Product

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("/")
async def get_inventory(db: AsyncSession = Depends(get_db)):
    """API endpoint to get current stock levels for all products."""
    result = await db.execute(select(Inventory))
    return result.scalars().all()

@router.get("/movements")
async def get_inventory_movements(db: AsyncSession = Depends(get_db)):
    """API endpoint to view the audit trail of all inventory movements."""
    result = await db.execute(select(InventoryMovement).order_by(InventoryMovement.created_at.desc()))
    return result.scalars().all()

@router.get("/low-stock")
async def get_low_stock_products(db: AsyncSession = Depends(get_db)):
    """API endpoint to detect products where current stock is at or below minimum level."""
    # Joining Inventory and Product to filter current_stock <= min_stock_level
    query = (
        select(Inventory, Product)
        .join(Product, Inventory.product_id == Product.id)
        .where(Inventory.current_stock <= Product.min_stock_level)
    )
    result = await db.execute(query)
    low_stock_items = []
    for inv, prod in result.all():
        low_stock_items.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "current_stock": inv.current_stock,
            "min_stock_level": prod.min_stock_level
        })
    return low_stock_items