from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from schemas.sale import SaleItemCreate


def round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_line_subtotals(items: list[SaleItemCreate]) -> list[Decimal]:
    """Product Subtotal step: quantity x unit_price - item_discount, per line."""
    return [round2(item.unit_price * item.quantity - item.item_discount) for item in items]


def calculate_subtotal(items: list[SaleItemCreate]) -> Decimal:
    return round2(sum(calculate_line_subtotals(items), Decimal("0")))


def apply_discount(subtotal: Decimal, discount: Decimal, is_percent: bool = False) -> Decimal:
    """Discount step. Caps at subtotal so total never goes negative."""
    discount_amount = round2(subtotal * discount / 100) if is_percent else round2(discount)
    return min(discount_amount, subtotal)


def calculate_tax(amount_after_discount: Decimal, tax_rate: Decimal) -> Decimal:
    """Tax step, applied after discount."""
    return round2(amount_after_discount * tax_rate / 100)


def calculate_totals(
    items: list[SaleItemCreate],
    *,
    discount: Decimal,
    is_percent_discount: bool,
    tax_rate: Decimal,
) -> tuple[Decimal, Decimal, Decimal, Decimal, list[Decimal]]:
    """Full POS calculation pipeline:

    Product Subtotal -> Discount -> Tax -> Final Total

    Returns (subtotal, discount_amount, tax_amount, total, line_subtotals).
    """
    line_subtotals = calculate_line_subtotals(items)
    subtotal = round2(sum(line_subtotals, Decimal("0")))
    discount_amount = apply_discount(subtotal, discount, is_percent_discount)
    after_discount = subtotal - discount_amount
    tax_amount = calculate_tax(after_discount, tax_rate)
    total = after_discount + tax_amount
    return subtotal, discount_amount, tax_amount, total, line_subtotals
