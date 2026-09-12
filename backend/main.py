from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from common.config import get_settings
from database.session import dispose_database
from routes.activity_log_routes import router as activity_log_router
from routes.sales_routes import router as sales_router

settings = get_settings()
APP_NAME = settings.app_name
APP_VERSION = settings.app_version


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await dispose_database()


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity_log_router)
app.include_router(sales_router)

from routes.auth_routes import router as auth_router
from routes.customer_routes import router as customer_router
from routes.purchase_routes import router as purchase_router
from routes.supplier_routes import router as supplier_router
from routes.user_routes import router as user_router

app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(purchase_router)
app.include_router(supplier_router)
app.include_router(user_router)


@app.get("/")
def root():
    return {
        "message": "Inventory & Sales Management System API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
    }
