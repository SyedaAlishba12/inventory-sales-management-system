import asyncio
import sys
from sqlalchemy import select

from common.config import get_settings
from common.security import hash_password
from database.session import session_scope
from models.user import User, UserRole

async def run_seed() -> None:
    settings = get_settings()
    
    async with session_scope() as session:
        existing_admin = (
            await session.execute(select(User).where(User.role == UserRole.ADMIN))
        ).scalars().first()
        
        if existing_admin:
            print("An admin user already exists. Seed script exiting cleanly.")
            return

        email = settings.admin_seed_email
        password = settings.admin_seed_password
        name = settings.admin_seed_name

        if not email or not password or not name:
            print(
                "ERROR: Cannot create admin because seed variables are not set.\n"
                "Please set ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, and ADMIN_SEED_NAME in your .env file."
            )
            sys.exit(1)
            
        print(f"Creating bootstrap admin user: {email}")
        
        admin_user = User(
            full_name=name,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin_user)
        
    print("Admin user created successfully.")

if __name__ == "__main__":
    asyncio.run(run_seed())
