"""FastAPI route modules."""

from routes.activity_log_routes import router as activity_log_router
from routes.sales_routes import router as sales_router

__all__ = ["activity_log_router", "sales_router"]
