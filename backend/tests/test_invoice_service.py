import uuid
from datetime import datetime, timezone
from decimal import Decimal

from models.sale import PaymentMethod, Sale, SaleStatus
from models.sale_item import SaleItem
from services.invoice_service import generate_invoice_pdf


def make_sale(item_count: int = 1) -> Sale:
    sale = Sale(
        id=uuid.uuid4(),
        invoice_number="INV-00099",
        user_id=uuid.uuid4(),
        customer_id=None,
        sale_date=datetime.now(timezone.utc),
        subtotal=Decimal("1000.00"),
        discount=Decimal("50.00"),
        tax=Decimal("0.00"),
        total=Decimal("950.00"),
        payment_method=PaymentMethod.CASH,
        status=SaleStatus.COMPLETED,
    )
    sale.items = [
        SaleItem(
            id=uuid.uuid4(),
            sale_id=sale.id,
            product_id=uuid.uuid4(),
            quantity=2,
            unit_price=Decimal("500.00"),
            item_discount=Decimal("50.00"),
            line_subtotal=Decimal("950.00"),
            created_at=datetime.now(timezone.utc),
        )
        for _ in range(item_count)
    ]
    return sale


def test_generate_invoice_pdf_returns_valid_pdf_bytes() -> None:
    sale = make_sale()

    pdf_bytes = generate_invoice_pdf(sale)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 500


def test_generate_invoice_pdf_handles_multiple_items() -> None:
    sale = make_sale(item_count=5)

    pdf_bytes = generate_invoice_pdf(sale)

    assert pdf_bytes.startswith(b"%PDF")


def test_generate_invoice_pdf_handles_walk_in_customer() -> None:
    # customer_id is None (walk-in) — must not raise.
    sale = make_sale()
    sale.customer_id = None

    pdf_bytes = generate_invoice_pdf(sale)

    assert pdf_bytes.startswith(b"%PDF")
