"""
backend/routes/customer_routes.py
-----------------------------------
Customer management endpoints — fully wired to customer_service.

    POST   /api/customers
    GET    /api/customers
    GET    /api/customers/{customer_id}
    PATCH  /api/customers/{customer_id}
    DELETE /api/customers/{customer_id}   (admin only)
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from middleware.auth_middleware import require_admin, require_staff
from schemas.customer_schema import CustomerCreate, CustomerResponse, CustomerUpdate
from services.customer_service import customer_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])

DatabaseSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
async def create_customer(
    payload: CustomerCreate,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> CustomerResponse:
    created = await customer_service.create(db, payload)
    return CustomerResponse.model_validate(created)


@router.get(
    "",
    response_model=list[CustomerResponse],
    summary="List all customers",
)
async def list_customers(
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> list[CustomerResponse]:
    customers = await customer_service.list_all(db)
    return [CustomerResponse.model_validate(c) for c in customers]


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer by ID",
)
async def get_customer(
    customer_id: uuid.UUID,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> CustomerResponse:
    customer = await customer_service.get(db, customer_id)
    return CustomerResponse.model_validate(customer)


@router.patch(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer by ID",
)
async def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdate,
    db: DatabaseSession,
    staff=Depends(require_staff),
) -> CustomerResponse:
    updated = await customer_service.update(db, customer_id, payload)
    return CustomerResponse.model_validate(updated)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer by ID (admin only)",
)
async def delete_customer(
    customer_id: uuid.UUID,
    db: DatabaseSession,
    admin=Depends(require_admin),
):
    await customer_service.delete(db, customer_id)
