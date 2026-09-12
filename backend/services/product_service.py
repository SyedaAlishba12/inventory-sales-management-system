from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List, Dict, Any
import uuid

from models.product import Product
from models.inventory import Inventory
from models.category import Category

class ProductService:
    """Service layer for managing products and their linked inventory records."""

    @staticmethod
    async def create_product(db: AsyncSession, product_data: dict) -> Product:
        """Create a new product and automatically initialize its inventory record."""
        # Check if SKU already exists
        existing_sku = await db.execute(select(Product).where(Product.sku == product_data["sku"]))
        if existing_sku.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A product with this SKU already exists."
            )

        # Verify category existence
        category = await db.get(Category, product_data["category_id"])
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found."
            )

        # Create the product instance
        new_product = Product(**product_data)
        db.add(new_product)
        await db.flush()  # Flush to generate product.id before creating inventory

        # Automatically initialize inventory for the product
        initial_inventory = Inventory(
            product_id=new_product.id,
            current_stock=0,
            opening_stock=0,
            damaged_stock=0
        )
        db.add(initial_inventory)

        await db.commit()
        await db.refresh(new_product)
        return new_product

    @staticmethod
    async def get_product_by_id(db: AsyncSession, product_id: uuid.UUID) -> Product:
        """Retrieve a product by its unique ID."""
        product = await db.get(Product, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found."
            )
        return product

    @staticmethod
    async def get_all_products(db: AsyncSession) -> List[Product]:
        """Retrieve all registered products."""
        result = await db.execute(select(Product))
        return result.scalars().all()

    @staticmethod
    async def update_product(db: AsyncSession, product_id: uuid.UUID, update_data: Dict[str, Any]) -> Product:
        """Update an existing product's attributes."""
        product = await ProductService.get_product_by_id(db, product_id)

        # If SKU is being updated, check for duplicates
        if "sku" in update_data and update_data["sku"] != product.sku:
            existing_sku = await db.execute(select(Product).where(Product.sku == update_data["sku"]))
            if existing_sku.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A product with this SKU already exists."
                )

        # If category_id is being updated, verify it exists
        if "category_id" in update_data:
            category = await db.get(Category, update_data["category_id"])
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found."
                )

        for key, value in update_data.items():
            setattr(product, key, value)

        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def delete_product(db: AsyncSession, product_id: uuid.UUID) -> dict:
        """Delete a product by its ID."""
        product = await ProductService.get_product_by_id(db, product_id)
        
        await db.delete(product)
        await db.commit()
        return {"detail": "Product deleted successfully."}