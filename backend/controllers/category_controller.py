from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from services.category_service import CategoryService
from schemas.category_schema import CategoryCreate, CategoryUpdate

class CategoryController:
    """Controller layer handling business logic orchestration for Categories."""

    @staticmethod
    async def create_new_category(db: AsyncSession, category_in: CategoryCreate):
        """Orchestrate the creation of a new category."""
        category_data = category_in.model_dump()
        return await CategoryService.create_category(db, category_data)

    @staticmethod
    async def list_all_categories(db: AsyncSession):
        """Orchestrate retrieving all categories."""
        return await CategoryService.get_all_categories(db)

    @staticmethod
    async def get_single_category(db: AsyncSession, category_id: uuid.UUID):
        """Orchestrate retrieving a specific category by ID."""
        return await CategoryService.get_category_by_id(db, category_id)

    @staticmethod
    async def update_existing_category(db: AsyncSession, category_id: uuid.UUID, category_in: CategoryUpdate):
        """Orchestrate updating an existing category."""
        update_data = category_in.model_dump(exclude_unset=True)
        return await CategoryService.update_category(db, category_id, update_data)

    @staticmethod
    async def remove_category(db: AsyncSession, category_id: uuid.UUID):
        """Orchestrate deletion of a category."""
        return await CategoryService.delete_category(db, category_id)