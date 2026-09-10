import argparse
import asyncio

from sqlalchemy.ext.asyncio import AsyncEngine

from database.base import Base
from database.model_loader import load_all_models
from database.session import check_database_connection, engine


async def initialize_database(
    database_engine: AsyncEngine = engine,
    *,
    create_tables: bool = False,
) -> None:
    load_all_models()
    await check_database_connection(database_engine)
    if create_tables:
        async with database_engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)


def main() -> None:
    parser = argparse.ArgumentParser(description="Check or initialize the database")
    parser.add_argument(
        "--create-tables",
        action="store_true",
        help=(
            "Create registered tables for local development only; "
            "use Alembic normally."
        ),
    )
    arguments = parser.parse_args()
    asyncio.run(initialize_database(create_tables=arguments.create_tables))
    action = "initialized" if arguments.create_tables else "connection verified"
    print(f"Database {action} successfully.")


if __name__ == "__main__":
    main()
