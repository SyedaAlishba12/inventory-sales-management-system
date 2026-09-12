from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List, Dict, Any
import uuid

from models.inventory import Inventory
from models.inventory_movement import InventoryMovement
from models.product import Product
from models.notification import Notification

class InventoryService:
    """Service layer for handling stock adjustments, movements, and low stock tracking."""

    @staticmethod
    async def get_all_inventory(db: AsyncSession) -> List[Inventory]:
        """Retrieve current stock levels for all products."""
        result = await db.execute(select(Inventory))
        return result.scalars().all()

    @staticmethod
    async def get_inventory_movements(db: AsyncSession) -> List[InventoryMovement]:
        """Retrieve the audit trail of all inventory movements ordered by latest first."""
        result = await db.execute(select(InventoryMovement).order_by(InventoryMovement.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def get_low_stock_products(db: AsyncSession) -> List[Dict[str, Any]]:
        """Detect products where current stock is at or below minimum level."""
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

    @staticmethod
    async def process_stock_in(
        db: AsyncSession, 
        product_id: uuid.UUID, 
        quantity: int, 
        user_id: uuid.UUID, 
        reason: str = "Purchase Received"
    ) -> Inventory:
        """Increase stock when a purchase is received and record a STOCK_IN movement."""
        result = await db.execute(select(Inventory).where(Inventory.product_id == product_id))
        inventory = result.scalars().first()
        
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory record not found for this product."
            )

        previous_stock = inventory.current_stock
        new_stock = previous_stock + quantity
        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type="STOCK_IN",
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason
        )
        db.add(movement)

        # Check for low stock status and trigger notification if necessary
        product = await db.get(Product, product_id)
        if product and new_stock <= product.min_stock_level:
            notification = Notification(
                product_id=product.id,
                title="Low Stock Alert",
                message=f"Product '{product.name}' is low in stock. Current stock: {new_stock}.",
                type="LOW_STOCK",
                is_read=False
            )
            db.add(notification)

        await db.commit()
        await db.refresh(inventory)
        return inventory

    @staticmethod
    async def process_stock_out(
        db: AsyncSession, 
        product_id: uuid.UUID, 
        quantity: int, 
        user_id: uuid.UUID, 
        reason: str = "Sale Completed"
    ) -> Inventory:
        """Decrease stock when a sale is completed and record a STOCK_OUT movement."""
        result = await db.execute(select(Inventory).where(Inventory.product_id == product_id))
        inventory = result.scalars().first()
        
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory record not found for this product."
            )

        previous_stock = inventory.current_stock
        if previous_stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product ID {product_id}. Available: {previous_stock}, Requested: {quantity}."
            )

        new_stock = previous_stock - quantity
        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type="STOCK_OUT",
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason
        )
        db.add(movement)

        # Trigger low stock notification if current stock falls below minimum level
        product = await db.get(Product, product_id)
        if product and new_stock <= product.min_stock_level:
            notification = Notification(
                product_id=product.id,
                title="Low Stock Alert",
                message=f"Product '{product.name}' is low in stock. Current stock: {new_stock}.",
                type="LOW_STOCK",
                is_read=False
            )
            db.add(notification)

        await db.commit()
        await db.refresh(inventory)
        return inventory

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        product_id: uuid.UUID,
        quantity: int,
        movement_type: str,
        user_id: uuid.UUID,
        reason: Optional[str] = None
    ) -> Inventory:
        """Handle manual stock adjustments such as DAMAGED or general ADJUSTMENT types."""
        result = await db.execute(select(Inventory).where(Inventory.product_id == product_id))
        inventory = result.scalars().first()

        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory record not found for this product."
            )

        previous_stock = inventory.current_stock

        if movement_type == "STOCK_IN":
            new_stock = previous_stock + quantity
        elif movement_type in ["STOCK_OUT", "DAMAGED"]:
            if previous_stock < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Adjustment quantity exceeds current stock level."
                )
            new_stock = previous_stock - quantity
            if movement_type == "DAMAGED":
                inventory.damaged_stock += quantity
        elif movement_type == "ADJUSTMENT":
            # Direct override or delta adjustment based on business rule
            new_stock = quantity
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid movement type specified."
            )

        inventory.current_stock = new_stock

        movement = InventoryMovement(
            product_id=product_id,
            user_id=user_id,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason
        )
        db.add(movement)

        product = await db.get(Product, product_id)
        if product and new_stock <= product.min_stock_level:
            notification = Notification(
                product_id=product.id,
                title="Low Stock Alert",
                message=f"Product '{product.name}' is low in stock. Current stock: {new_stock}.",
                type="LOW_STOCK",
                is_read=False
            )
            db.add(notification)

        await db.commit()
        await db.refresh(inventory)
        return inventory