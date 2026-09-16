from decimal import Decimal

from schemas.sale import SaleItemCreate
from services import pos_service
from uuid import uuid4


def make_item(quantity: int, unit_price: str, item_discount: str = "0") -> SaleItemCreate:
    return SaleItemCreate(
        product_id=uuid4(),
        quantity=quantity,
        unit_price=Decimal(unit_price),
        item_discount=Decimal(item_discount),
    )


def test_calculate_line_subtotals_applies_quantity_and_item_discount() -> None:
    items = [make_item(2, "500.00", "50.00"), make_item(1, "1000.00")]

    result = pos_service.calculate_line_subtotals(items)

    assert result == [Decimal("950.00"), Decimal("1000.00")]


def test_calculate_subtotal_sums_all_lines() -> None:
    items = [make_item(2, "500.00"), make_item(1, "250.50")]

    assert pos_service.calculate_subtotal(items) == Decimal("1250.50")


def test_apply_discount_flat_amount() -> None:
    assert pos_service.apply_discount(Decimal("1000.00"), Decimal("100.00")) == Decimal("100.00")


def test_apply_discount_percent() -> None:
    result = pos_service.apply_discount(Decimal("1000.00"), Decimal("10"), is_percent=True)

    assert result == Decimal("100.00")


def test_apply_discount_never_exceeds_subtotal() -> None:
    # A flat discount larger than the subtotal must be capped, so total never
    # goes negative.
    result = pos_service.apply_discount(Decimal("100.00"), Decimal("500.00"))

    assert result == Decimal("100.00")


def test_calculate_tax_applies_after_discount() -> None:
    assert pos_service.calculate_tax(Decimal("900.00"), Decimal("5")) == Decimal("45.00")


def test_calculate_totals_full_pipeline() -> None:
    items = [make_item(2, "500.00"), make_item(1, "1000.00")]

    subtotal, discount, tax, total, line_subtotals = pos_service.calculate_totals(
        items,
        discount=Decimal("200.00"),
        is_percent_discount=False,
        tax_rate=Decimal("5"),
    )

    assert subtotal == Decimal("2000.00")
    assert discount == Decimal("200.00")
    # (2000 - 200) * 5% = 90.00
    assert tax == Decimal("90.00")
    assert total == Decimal("1890.00")
    assert line_subtotals == [Decimal("1000.00"), Decimal("1000.00")]


def test_calculate_totals_with_zero_discount_and_tax() -> None:
    items = [make_item(1, "499.99")]

    subtotal, discount, tax, total, _ = pos_service.calculate_totals(
        items, discount=Decimal("0"), is_percent_discount=False, tax_rate=Decimal("0")
    )

    assert subtotal == total == Decimal("499.99")
    assert discount == tax == Decimal("0.00")
