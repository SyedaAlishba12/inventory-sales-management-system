from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from typing import List, Dict, Any
import uuid

from models.category import Category

class CategoryService:
    """Service layer for managing product categories."""

    @staticmethod
    async def create_category(db: AsyncSession, category_data: dict) -> Category:
        """Create a new category with a unique name."""
        # Check if category name already exists
        existing = await db.execute(select(Category).where(Category.name == category_data["name"]))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists."
            )

        new_category = Category(**category_data)
        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)
        return new_category

    @staticmethod
    async def get_all_categories(db: AsyncSession) -> List[Category]:
        """Retrieve all available categories."""
        result = await db.execute(select(Category))
        return result.scalars().all()

    @staticmethod
    async def get_category_by_id(db: AsyncSession, category_id: uuid.UUID) -> Category:
        """Retrieve a single category by its unique ID."""
        category = await db.get(Category, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found."
            )
        return category

    @staticmethod
    async def update_category(db: AsyncSession, category_id: uuid.UUID, update_data: Dict[str, Any]) -> Category:
        """Update an existing category's attributes."""
        category = await CategoryService.get_category_by_id(db, category_id)

        # If name is being updated, check for duplicates
        if "name" in update_data and update_data["name"] != category.name:
            existing = await db.execute(select(Category).where(Category.name == update_data["name"]))
            if existing.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this name already exists."
                )

        for key, value in update_data.items():
            setattr(category, key, value)

        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: uuid.UUID) -> dict:
        """Delete a category by ID."""
        category = await CategoryService.get_category_by_id(db, category_id)
        await db.delete(category)
        await db.commit()
        return {"message": "Category deleted successfully."}