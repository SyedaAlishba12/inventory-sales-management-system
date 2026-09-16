import os

# Tests must never load or connect with a developer's private database URL.
os.environ["APP_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from database.base import Base

from database.model_loader import load_all_models
load_all_models()

