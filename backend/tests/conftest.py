import os

# Tests must never load or connect with a developer's private database URL.
os.environ["APP_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from database.base import Base
from sqlalchemy import Column, Integer, ForeignKey, Uuid
from sqlalchemy.orm import relationship

# Mock SaleItem to satisfy Product's relationship mapper during tests
class SaleItem(Base):
    __tablename__ = "mock_sale_items"
    id = Column(Integer, primary_key=True)
    product_id = Column(Uuid(as_uuid=True), ForeignKey("products.id"))
    product = relationship("Product", back_populates="sale_items")

from database.model_loader import load_all_models
load_all_models()
