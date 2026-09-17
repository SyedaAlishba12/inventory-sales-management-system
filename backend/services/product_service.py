from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from typing import List, Dict, Any, Optional
import uuid

from models.product import Product
from models.inventory import Inventory
from models.category import Category


class ProductService:
    """Service layer for managing products and inventory."""

    @staticmethod
    async def create_product(
        db: AsyncSession,
        product_data: dict
    ) -> Product:

        # Remove initial_stock because it does not belong to Product table
        initial_stock = product_data.pop("initial_stock", 0)

        # Check duplicate SKU
        existing_sku = await db.execute(
            select(Product).where(
                Product.sku == product_data["sku"]
            )
        )

        if existing_sku.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A product with this SKU already exists."
            )

        # Check category
        category = await db.get(
            Category,
            product_data["category_id"]
        )

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found."
            )

        # Create product
        new_product = Product(**product_data)

        db.add(new_product)

        # Generate product UUID
        await db.flush()

        # Create inventory automatically
        initial_inventory = Inventory(
            product_id=new_product.id,
            current_stock=initial_stock,
            opening_stock=initial_stock,
            damaged_stock=0
        )

        db.add(initial_inventory)

        await db.commit()

        # Reload product with category + inventory
        return await ProductService.get_product_by_id(
            db,
            new_product.id
        )

    @staticmethod
    async def get_product_by_id(
        db: AsyncSession,
        product_id: uuid.UUID
    ) -> Product:

        stmt = (
            select(Product)
            .options(
                selectinload(Product.inventory),
                selectinload(Product.category)
            )
            .where(Product.id == product_id)
        )

        result = await db.execute(stmt)

        product = result.scalars().first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found."
            )

        return product

    @staticmethod
    async def get_all_products(
        db: AsyncSession
    ) -> List[Product]:

        stmt = (
            select(Product)
            .options(
                selectinload(Product.inventory),
                selectinload(Product.category)
            )
        )

        result = await db.execute(stmt)

        return result.scalars().all()

    @staticmethod
    async def search_products(
        db: AsyncSession,
        query: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        limit: int = 50
    ) -> List[Product]:

        stmt = (
            select(Product)
            .options(
                selectinload(Product.inventory),
                selectinload(Product.category)
            )
        )

        # Search by product name or SKU
        if query:
            search_term = f"%{query}%"

            stmt = stmt.where(
                (Product.name.ilike(search_term)) |
                (Product.sku.ilike(search_term))
            )

        # Filter by category
        if category_id:
            stmt = stmt.where(
                Product.category_id == category_id
            )

        stmt = stmt.limit(limit)

        result = await db.execute(stmt)

        return result.scalars().all()

    @staticmethod
    async def update_product(
        db: AsyncSession,
        product_id: uuid.UUID,
        update_data: Dict[str, Any]
    ) -> Product:

        product = await ProductService.get_product_by_id(
            db,
            product_id
        )

        # Check duplicate SKU
        if (
            "sku" in update_data
            and update_data["sku"] != product.sku
        ):
            existing_sku = await db.execute(
                select(Product).where(
                    Product.sku == update_data["sku"]
                )
            )

            if existing_sku.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A product with this SKU already exists."
                )

        # Check category
        if "category_id" in update_data:

            category = await db.get(
                Category,
                update_data["category_id"]
            )

            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found."
                )

        # Update fields
        for key, value in update_data.items():
            setattr(product, key, value)

        await db.commit()

        # IMPORTANT:
        # Reload with category + inventory
        # instead of only db.refresh()
        return await ProductService.get_product_by_id(
            db,
            product.id
        )

    @staticmethod
    async def delete_product(
        db: AsyncSession,
        product_id: uuid.UUID
    ) -> dict:

        product = await ProductService.get_product_by_id(
            db,
            product_id
        )

        await db.delete(product)

        await db.commit()

        return {
            "detail": "Product deleted successfully."
        }