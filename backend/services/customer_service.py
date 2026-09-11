"""
backend/services/customer_service.py
--------------------------------------
Customer management business logic — full CRUD.

Uses:
    models.customer      — Customer
    schemas.customer_schema — CustomerCreate, CustomerUpdate
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.customer import Customer
from schemas.customer_schema import CustomerCreate, CustomerUpdate


class CustomerService:

    # ------------------------------------------------------------------
    # create
    # ------------------------------------------------------------------

    async def create(self, db: AsyncSession, payload: CustomerCreate) -> Customer:
        """Create a new customer.

        Raises:
            HTTPException 409: If a customer with the same phone already exists,
                               or if email is provided and already in use.
        """
        phone_conflict = (
            await db.execute(select(Customer).where(Customer.phone == payload.phone))
        ).scalar_one_or_none()
        if phone_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A customer with this phone number already exists.",
            )

        if payload.email:
            email_conflict = (
                await db.execute(
                    select(Customer).where(Customer.email == payload.email)
                )
            ).scalar_one_or_none()
            if email_conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A customer with this email already exists.",
                )

        customer = Customer(**payload.model_dump())
        db.add(customer)
        await db.flush()
        await db.refresh(customer)
        await db.commit()
        return customer

    # ------------------------------------------------------------------
    # read
    # ------------------------------------------------------------------

    async def get(self, db: AsyncSession, customer_id: uuid.UUID) -> Customer:
        """Fetch a customer by UUID; raise 404 if not found."""
        customer = await db.get(Customer, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found.",
            )
        return customer

    async def list_all(self, db: AsyncSession) -> list[Customer]:
        """Return all customers ordered by creation date (newest first)."""
        result = await db.execute(
            select(Customer).order_by(Customer.created_at.desc())
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # update
    # ------------------------------------------------------------------

    async def update(
        self, db: AsyncSession, customer_id: uuid.UUID, payload: CustomerUpdate
    ) -> Customer:
        """Apply a partial update to a customer.

        Raises:
            HTTPException 404: If the customer is not found.
            HTTPException 409: If the updated phone/email conflicts with another record.
        """
        customer = await self.get(db, customer_id)

        if payload.name is not None:
            customer.name = payload.name

        if payload.phone is not None and payload.phone != customer.phone:
            conflict = (
                await db.execute(
                    select(Customer).where(Customer.phone == payload.phone)
                )
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Phone number is already in use by another customer.",
                )
            customer.phone = payload.phone

        if payload.email is not None and payload.email != customer.email:
            conflict = (
                await db.execute(
                    select(Customer).where(Customer.email == payload.email)
                )
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email is already in use by another customer.",
                )
            customer.email = payload.email

        if payload.address is not None:
            customer.address = payload.address

        await db.flush()
        await db.refresh(customer)
        await db.commit()
        return customer

    # ------------------------------------------------------------------
    # delete
    # ------------------------------------------------------------------

    async def delete(self, db: AsyncSession, customer_id: uuid.UUID) -> None:
        """Hard-delete a customer.

        Raises:
            HTTPException 404: If the customer is not found.
        """
        customer = await self.get(db, customer_id)
        await db.delete(customer)
        await db.commit()


customer_service = CustomerService()
