"""
backend/routes/customer_routes.py
-----------------------------------
Route stubs for customer management endpoints.

All paths match the division document spec:
    POST   /api/customers
    GET    /api/customers
    GET    /api/customers/{customer_id}
    PATCH  /api/customers/{customer_id}
    DELETE /api/customers/{customer_id}

Service-layer calls raise NotImplementedError because:
    - backend/models/customer.py (Customer ORM model) does not yet exist.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.middleware.auth_middleware import get_db, require_admin, require_staff
from backend.schemas.customer_schema import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
async def create_customer(
    payload: CustomerCreate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Create a new customer record.

    Blocked on: backend/models/customer.py (Customer ORM model)
    Next step:  from backend.services.customer_service import CustomerService
                return await CustomerService(db).create(payload)
    """
    raise NotImplementedError(
        "create_customer is blocked on backend/models/customer.py — "
        "implement CustomerService.create() once the model exists."
    )


@router.get(
    "",
    response_model=list[CustomerResponse],
    summary="List all customers",
)
async def list_customers(
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a list of all customers.

    Blocked on: backend/models/customer.py (Customer ORM model)
    Next step:  from backend.services.customer_service import CustomerService
                return await CustomerService(db).list_all()
    """
    raise NotImplementedError(
        "list_customers is blocked on backend/models/customer.py — "
        "implement CustomerService.list_all() once the model exists."
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer by ID",
)
async def get_customer(
    customer_id: uuid.UUID,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Return a single customer by UUID.

    Blocked on: backend/models/customer.py (Customer ORM model)
    Next step:  from backend.services.customer_service import CustomerService
                return await CustomerService(db).get(customer_id)
    """
    raise NotImplementedError(
        "get_customer is blocked on backend/models/customer.py — "
        "implement CustomerService.get() once the model exists."
    )


@router.patch(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer by ID",
)
async def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdate,
    staff=Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    """Apply a partial update to a customer record.

    Blocked on: backend/models/customer.py (Customer ORM model)
    Next step:  from backend.services.customer_service import CustomerService
                return await CustomerService(db).update(customer_id, payload)
    """
    raise NotImplementedError(
        "update_customer is blocked on backend/models/customer.py — "
        "implement CustomerService.update() once the model exists."
    )


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer by ID (admin only)",
)
async def delete_customer(
    customer_id: uuid.UUID,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a customer record (admin-only operation).

    Blocked on: backend/models/customer.py (Customer ORM model)
    Next step:  from backend.services.customer_service import CustomerService
                await CustomerService(db).delete(customer_id)
    """
    raise NotImplementedError(
        "delete_customer is blocked on backend/models/customer.py — "
        "implement CustomerService.delete() once the model exists."
    )
