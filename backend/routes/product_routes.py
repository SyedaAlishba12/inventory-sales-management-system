from fastapi import (
    APIRouter,
    Depends,
    status,
    Query,
    UploadFile,
    File,
    HTTPException,
)

from sqlalchemy.ext.asyncio import AsyncSession

from typing import List, Optional
from pathlib import Path
import uuid
import shutil

from database.session import get_db
from controllers.product_controller import ProductController
from middleware.auth_middleware import require_staff
from models.user import User
from schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


# ---------------------------------------------------------
# CREATE PRODUCT
# ---------------------------------------------------------

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return await ProductController.create_new_product(
        db,
        product_in,
        current_user.id,
    )


# ---------------------------------------------------------
# GET PRODUCTS
# ---------------------------------------------------------

@router.get(
    "",
    response_model=List[ProductResponse],
)
async def get_products(
    search: Optional[str] = Query(
        None,
        description="Search products by name or SKU",
    ),

    category_id: Optional[uuid.UUID] = Query(
        None,
        description="Filter products by category ID",
    ),

    db: AsyncSession = Depends(get_db),
):

    return await ProductController.list_all_products(
        db,
        search=search,
        category_id=category_id,
    )


# ---------------------------------------------------------
# GET SINGLE PRODUCT
# ---------------------------------------------------------

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):

    return await ProductController.get_single_product(
        db,
        product_id,
    )


# ---------------------------------------------------------
# UPDATE PRODUCT
# ---------------------------------------------------------

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
async def update_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return await ProductController.update_existing_product(
        db,
        product_id,
        product_in,
        current_user.id,
    )


# ---------------------------------------------------------
# DELETE PRODUCT
# ---------------------------------------------------------

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):

    return await ProductController.remove_product(
        db,
        product_id,
        current_user.id,
    )


# ---------------------------------------------------------
# UPLOAD PRODUCT IMAGE
# ---------------------------------------------------------

@router.post(
    "/upload-image",
)
async def upload_product_image(
    file: UploadFile = File(...),
):

    # Allowed image types
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed.",
        )

    # Create upload directory
    upload_dir = Path("uploads/products")
    upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Generate unique filename
    file_name = (
        f"{uuid.uuid4()}"
        f"{allowed_types[file.content_type]}"
    )

    file_path = upload_dir / file_name

    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    # URL stored in database
    image_url = f"/uploads/products/{file_name}"

    return {
        "image_url": image_url,
    }