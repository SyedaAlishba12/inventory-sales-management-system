"""FastAPI route modules."""

from routes.activity_log_routes import router as activity_log_router
from routes.pos_routes import router as pos_router
from routes.sales_routes import router as sales_router
from routes.product_routes import router as product_router
from routes.category_routes import router as category_router
from routes.inventory_routes import router as inventory_router
from routes.notification_routes import router as notification_router
from routes.auth_routes import router as auth_router
from routes.customer_routes import router as customer_router
from routes.purchase_routes import router as purchase_router
from routes.supplier_routes import router as supplier_router
from routes.user_routes import router as user_router

__all__ = [
    "activity_log_router",
    "pos_router",
    "sales_router",
    "product_router",
    "category_router",
    "inventory_router",
    "notification_router",
    "auth_router",
    "customer_router",
    "purchase_router",
    "supplier_router",
    "user_router",
]
