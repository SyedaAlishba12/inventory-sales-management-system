from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database.session import get_db
from controllers.product_controller import ProductController
from schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db)):
    """API endpoint to create a new product."""
    return await ProductController.create_new_product(db, product_in)

@router.get("/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    """API endpoint to list all products."""
    return await ProductController.list_all_products(db)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """API endpoint to retrieve a single product by ID."""
    return await ProductController.get_single_product(db, product_id)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: uuid.UUID, product_in: ProductUpdate, db: AsyncSession = Depends(get_db)):
    """API endpoint to update an existing product."""
    return await ProductController.update_existing_product(db, product_id, product_in)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """API endpoint to delete a product."""
    return await ProductController.remove_product(db, product_id)