from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from controllers.inventory_controller import InventoryController
from database.session import get_db_session
from middleware.auth_middleware import require_admin, require_staff
from models.user import User
from schemas.inventory_schema import (
    InventoryAdjustmentCreate,
    InventoryMovementResponse,
    InventoryResponse,
)


router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"],
)


# =========================================================
# GET ALL INVENTORY
# ADMIN + STAFF
# =========================================================

@router.get(
    "/",
    response_model=list[InventoryResponse],
)
async def get_inventory(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    return await InventoryController.get_all_inventory_records(db)


# =========================================================
# GET INVENTORY MOVEMENTS
# ADMIN + STAFF
# =========================================================

@router.get(
    "/movements",
    response_model=list[InventoryMovementResponse],
)
async def get_inventory_movements(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    return await InventoryController.get_all_movements(db)


# =========================================================
# GET LOW STOCK ITEMS
# ADMIN + STAFF
# =========================================================

@router.get(
    "/low-stock",
    response_model=list[InventoryResponse],
)
async def get_low_stock_inventory(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_staff),
):
    return await InventoryController.get_low_stock_items(db)


# =========================================================
# MANUAL INVENTORY ADJUSTMENT
# ADMIN ONLY
# =========================================================

@router.post(
    "/adjust",
    response_model=InventoryResponse,
)
async def adjust_inventory_stock(
    adjustment: InventoryAdjustmentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_admin),
):
    try:
        inventory = await InventoryController.adjust_product_stock(
            db=db,
            adjustment=adjustment,
            user_id=current_user.id,
        )

        await db.commit()
        await db.refresh(inventory)

        return inventory

    except HTTPException:
        await db.rollback()
        raise

    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to adjust inventory stock.",
        )