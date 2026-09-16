import asyncio
from sqlalchemy import text
from database.session import create_database_engine
from common.config import get_settings


async def check():
    engine = create_database_engine(get_settings())
    async with engine.connect() as conn:
        # List every enum type that actually exists in the database
        result = await conn.execute(text(
            "SELECT t.typname, e.enumlabel "
            "FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid "
            "ORDER BY t.typname, e.enumsortorder"
        ))
        print("All enum types in database:")
        for row in result:
            print(" ", row[0], "->", row[1])

        # Check the actual column type for users.role directly
        result = await conn.execute(text(
            "SELECT column_name, data_type, udt_name "
            "FROM information_schema.columns "
            "WHERE table_name = 'users' AND column_name = 'role'"
        ))
        print()
        print("users.role column info:")
        for row in result:
            print(" ", dict(row._mapping))

    await engine.dispose()


asyncio.run(check())