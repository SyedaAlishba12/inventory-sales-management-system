from fastapi import FastAPI

app = FastAPI(
    title="Inventory & Sales Management System",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Inventory & Sales Management System API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }