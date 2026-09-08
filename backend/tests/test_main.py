from httpx import ASGITransport, AsyncClient

from main import APP_NAME, APP_VERSION, app


async def get_response(path: str):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        return await client.get(path)


async def test_root_endpoint() -> None:
    response = await get_response("/")

    assert response.status_code == 200
    assert response.json() == {"message": f"{APP_NAME} API"}


async def test_health_endpoint() -> None:
    response = await get_response("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
    }


async def test_frontend_origin_is_allowed_by_cors() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
