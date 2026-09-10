from sqlalchemy import text

from common.config import Settings
from database.base import NAMING_CONVENTION, Base
from database.model_loader import load_all_models
from database.session import (
    check_database_connection,
    create_database_engine,
    create_session_factory,
    session_scope,
)


def sqlite_settings() -> Settings:
    return Settings(
        _env_file=None,
        app_env="testing",
        database_url="sqlite+aiosqlite:///:memory:",
    )


def test_settings_parse_comma_separated_cors_origins() -> None:
    settings = Settings(
        _env_file=None,
        cors_origins="http://localhost:3000, https://inventory.example.com",
    )

    assert settings.cors_origin_list == [
        "http://localhost:3000",
        "https://inventory.example.com",
    ]


def test_base_uses_deterministic_constraint_names() -> None:
    assert Base.metadata.naming_convention == NAMING_CONVENTION
    assert NAMING_CONVENTION["fk"].startswith("fk_")


def test_model_loader_discovers_registered_model_modules() -> None:
    assert isinstance(load_all_models(), list)


async def test_database_connection_and_transaction_scope() -> None:
    database_engine = create_database_engine(sqlite_settings())
    session_factory = create_session_factory(database_engine)

    try:
        assert await check_database_connection(database_engine) is True
        async with database_engine.begin() as connection:
            await connection.execute(
                text("CREATE TABLE foundation_test (id INTEGER PRIMARY KEY, name TEXT)")
            )

        async with session_scope(session_factory) as session:
            await session.execute(
                text("INSERT INTO foundation_test (name) VALUES (:name)"),
                {"name": "Inventra"},
            )

        async with session_factory() as session:
            result = await session.execute(
                text("SELECT name FROM foundation_test WHERE id = 1")
            )
            assert result.scalar_one() == "Inventra"
    finally:
        await database_engine.dispose()
