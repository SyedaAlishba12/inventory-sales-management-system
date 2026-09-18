import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.notification import Notification, NotificationType


class NotificationService:
    """Service layer for creating and managing system notifications."""

    # ============================================================
    # GET ALL NOTIFICATIONS
    # ============================================================

    @staticmethod
    async def get_all_notifications(
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
    ) -> List[Notification]:
        """
        Retrieve notifications ordered from newest to oldest.

        If user_id is provided:
        - return notifications assigned to that user
        - also return broadcast notifications where user_id is NULL
        """

        query = select(Notification)

        if user_id is not None:
            query = query.where(
                (Notification.user_id == user_id)
                | (Notification.user_id.is_(None))
            )

        query = query.order_by(Notification.created_at.desc())

        result = await db.execute(query)

        return list(result.scalars().all())

    # ============================================================
    # GET SINGLE NOTIFICATION
    # ============================================================

    @staticmethod
    async def get_notification_by_id(
        db: AsyncSession,
        notification_id: uuid.UUID,
    ) -> Notification:
        """Retrieve one notification by ID."""

        notification = await db.get(Notification, notification_id)

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )

        return notification

    # ============================================================
    # MARK SINGLE NOTIFICATION AS READ
    # ============================================================

    @staticmethod
    async def mark_notification_as_read(
        db: AsyncSession,
        notification_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """
        Mark a notification as read.

        No commit is performed here.
        The route/controller owns the transaction.
        """

        notification = await db.get(Notification, notification_id)

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )

        # If notification belongs to a specific user,
        # another user should not be able to modify it.
        if (
            user_id is not None
            and notification.user_id is not None
            and notification.user_id != user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to modify this notification.",
            )

        notification.is_read = True

        return notification

    # ============================================================
    # MARK ALL NOTIFICATIONS AS READ
    # ============================================================

    @staticmethod
    async def mark_all_as_read(
        db: AsyncSession,
        user_id: Optional[uuid.UUID] = None,
    ) -> dict:
        """
        Mark all visible unread notifications as read.

        No commit is performed here.
        """

        if user_id is not None:
            query = (
                update(Notification)
                .where(
                    Notification.is_read.is_(False),
                    (
                        (Notification.user_id == user_id)
                        | (Notification.user_id.is_(None))
                    ),
                )
                .values(is_read=True)
            )
        else:
            query = (
                update(Notification)
                .where(Notification.is_read.is_(False))
                .values(is_read=True)
            )

        result = await db.execute(query)

        return {
            "message": "All notifications marked as read.",
            "updated_count": result.rowcount or 0,
        }

    # ============================================================
    # GENERIC CREATE NOTIFICATION
    # ============================================================

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        title: str,
        message: str,
        notification_type: NotificationType,
        user_id: Optional[uuid.UUID] = None,
        product_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """
        Create a notification.

        IMPORTANT:
        This method does NOT commit.
        The caller's transaction controls the commit/rollback.
        """

        notification = Notification(
            user_id=user_id,
            product_id=product_id,
            title=title,
            message=message,
            is_read=False,
            type=notification_type,
        )

        db.add(notification)

        return notification

    # ============================================================
    # LOW STOCK NOTIFICATION
    # ============================================================

    @staticmethod
    async def create_low_stock_notification(
        db: AsyncSession,
        product_id: uuid.UUID,
        product_name: str,
        current_stock: int,
        minimum_stock: int,
        user_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """
        Create a LOW_STOCK notification for one product.
        """

        title = "Low Stock Alert"

        message = (
            f"{product_name} is low on stock. "
            f"Current stock: {current_stock}. "
            f"Minimum required: {minimum_stock}."
        )

        return await NotificationService.create_notification(
            db=db,
            title=title,
            message=message,
            notification_type=NotificationType.LOW_STOCK,
            user_id=user_id,
            product_id=product_id,
        )

    # ============================================================
    # MULTIPLE LOW STOCK NOTIFICATION
    # ============================================================

    @staticmethod
    async def create_multiple_low_stock_notification(
        db: AsyncSession,
        products: list,
        user_id: Optional[uuid.UUID] = None,
    ) -> Optional[Notification]:
        """
        Create one notification when multiple products
        are below their minimum stock level.

        Expected product objects/dicts should contain:
        - name
        - current_stock
        - min_stock_level
        """

        if not products:
            return None

        count = len(products)

        product_names = []

        for product in products:
            if isinstance(product, dict):
                product_names.append(str(product.get("name", "Product")))
            else:
                product_names.append(
                    str(getattr(product, "name", "Product"))
                )

        if count == 1:
            return None

        displayed_names = ", ".join(product_names[:5])

        if count > 5:
            displayed_names += f" and {count - 5} more"

        title = "Multiple Low Stock Alert"

        message = (
            f"{count} products are below their minimum stock level: "
            f"{displayed_names}."
        )

        return await NotificationService.create_notification(
            db=db,
            title=title,
            message=message,
            notification_type=NotificationType.MULTIPLE_LOW_STOCK,
            user_id=user_id,
        )

    # ============================================================
    # NEW SALE NOTIFICATION
    # ============================================================

    @staticmethod
    async def create_new_sale_notification(
        db: AsyncSession,
        sale_id: uuid.UUID,
        total_amount: Optional[float] = None,
        user_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """
        Create notification when a new sale is completed.
        """

        title = "New Sale"

        if total_amount is not None:
            message = (
                f"A new sale has been completed. "
                f"Sale ID: {sale_id}. "
                f"Total amount: {total_amount:.2f}."
            )
        else:
            message = (
                f"A new sale has been completed. "
                f"Sale ID: {sale_id}."
            )

        return await NotificationService.create_notification(
            db=db,
            title=title,
            message=message,
            notification_type=NotificationType.NEW_SALE,
            user_id=user_id,
        )

    # ============================================================
    # PURCHASE RECEIVED NOTIFICATION
    # ============================================================

    @staticmethod
    async def create_purchase_received_notification(
        db: AsyncSession,
        purchase_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """
        Create notification when a purchase is received.
        """

        title = "Purchase Received"

        message = (
            f"A purchase has been received successfully. "
            f"Purchase ID: {purchase_id}."
        )

        return await NotificationService.create_notification(
            db=db,
            title=title,
            message=message,
            notification_type=NotificationType.PURCHASE_RECEIVED,
            user_id=user_id,
        )