from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database.session import get_db
from controllers.category_controller import CategoryController
from schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """API endpoint to add a new category."""
    return await CategoryController.create_new_category(db, category_in)

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """API endpoint to list all categories."""
    return await CategoryController.list_all_categories(db)

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """API endpoint to retrieve a single category by ID."""
    return await CategoryController.get_single_category(db, category_id)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: uuid.UUID, category_in: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    """API endpoint to update an existing category."""
    return await CategoryController.update_existing_category(db, category_id, category_in)

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """API endpoint to delete a category."""
    return await CategoryController.remove_category(db, category_id)