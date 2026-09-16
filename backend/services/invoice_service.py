from __future__ import annotations

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

from models.sale import Sale

_styles = getSampleStyleSheet()
_title_style = ParagraphStyle(
    "InvoiceTitle", parent=_styles["Heading1"], fontSize=20, spaceAfter=2
)
_muted_style = ParagraphStyle(
    "Muted", parent=_styles["Normal"], textColor=colors.HexColor("#64748b")
)


def generate_invoice_pdf(sale: Sale) -> bytes:
    """Renders a Sale + its SaleItems as a printable invoice PDF."""

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        title=f"Invoice {sale.invoice_number}",
    )

    elements = [
        Paragraph("Inventory &amp; Sales Management System", _muted_style),
        Paragraph(f"Invoice {sale.invoice_number}", _title_style),
        Paragraph(sale.sale_date.strftime("%d %b %Y, %I:%M %p"), _muted_style),
        Spacer(1, 10 * mm),
    ]

    meta_rows = [
        ["Payment method", sale.payment_method.value],
        ["Status", sale.status.value],
        ["Customer", str(sale.customer_id) if sale.customer_id else "Walk-in customer"],
    ]
    meta_table = Table(meta_rows, colWidths=[45 * mm, 110 * mm])
    meta_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#64748b")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    elements.append(meta_table)
    elements.append(Spacer(1, 8 * mm))

    item_rows = [["Product", "Qty", "Unit price", "Discount", "Line total"]]
    for item in sale.items:
        # TODO: show product name instead of raw product_id once Zainab's
        # product read endpoint/service is available to resolve it.
        item_rows.append(
            [
                str(item.product_id),
                str(item.quantity),
                f"{item.unit_price:.2f}",
                f"{item.item_discount:.2f}",
                f"{item.line_subtotal:.2f}",
            ]
        )

    items_table = Table(item_rows, colWidths=[70 * mm, 20 * mm, 30 * mm, 25 * mm, 30 * mm])
    items_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("ALIGN", (0, 0), (0, -1), "LEFT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(items_table)
    elements.append(Spacer(1, 8 * mm))

    totals_rows = [
        ["Subtotal", f"{sale.subtotal:.2f}"],
        ["Discount", f"-{sale.discount:.2f}"],
        ["Tax", f"{sale.tax:.2f}"],
        ["Total", f"{sale.total:.2f}"],
    ]
    totals_table = Table(totals_rows, colWidths=[145 * mm, 30 * mm], hAlign="RIGHT")
    totals_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Bold"),
                ("FONTSIZE", (0, 3), (-1, 3), 11),
                ("LINEABOVE", (0, 3), (-1, 3), 0.75, colors.HexColor("#0f766e")),
                ("TOPPADDING", (0, 3), (-1, 3), 6),
            ]
        )
    )
    elements.append(totals_table)
    elements.append(Spacer(1, 12 * mm))
    elements.append(Paragraph("Thank you for your purchase.", _muted_style))

    doc.build(elements)
    return buffer.getvalue()
