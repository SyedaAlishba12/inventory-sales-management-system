from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List
import uuid

from services.product_service import ProductService
from schemas.product_schema import ProductCreate, ProductUpdate

class ProductController:
    """Controller layer handling business logic orchestration for Products."""

    @staticmethod
    async def create_new_product(db: AsyncSession, product_in: ProductCreate):
        """Orchestrate the creation of a new product."""
        # Convert Pydantic model to dictionary for service consumption
        product_data = product_in.model_dump()
        return await ProductService.create_product(db, product_data)

    @staticmethod
    async def list_all_products(db: AsyncSession):
        """Orchestrate retrieving all products."""
        return await ProductService.get_all_products(db)

    @staticmethod
    async def get_single_product(db: AsyncSession, product_id: uuid.UUID):
        """Orchestrate retrieving a specific product by ID."""
        return await ProductService.get_product_by_id(db, product_id)

    @staticmethod
    async def update_existing_product(db: AsyncSession, product_id: uuid.UUID, product_in: ProductUpdate):
        """Orchestrate updating an existing product."""
        update_data = product_in.model_dump(exclude_unset=True)
        return await ProductService.update_product(db, product_id, update_data)

    @staticmethod
    async def remove_product(db: AsyncSession, product_id: uuid.UUID):
        """Orchestrate deletion of a product."""
        return await ProductService.delete_product(db, product_id)