import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { humanize } from "@/utils/format";
import { customerDisplayName } from "@/utils/sale-mapper";
import type { SaleSummary } from "@/types/sale";

interface InvoiceDocumentProps {
  sale: SaleSummary;
}

export function InvoiceDocument({ sale }: InvoiceDocumentProps) {
  return (
    <Card className="mx-auto max-w-2xl print:border-0 print:shadow-none">
      <CardContent className="space-y-6 p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inventory & Sales Management System</p>
            <h2 className="text-2xl font-bold">Invoice {sale.invoiceNumber}</h2>
            <p className="text-sm text-muted-foreground">{formatDateTime(sale.saleDate)}</p>
          </div>
          <StatusBadge status={sale.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Payment method</p>
            <p className="font-medium">{humanize(sale.paymentMethod)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">
              {customerDisplayName(sale)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-left text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit price</th>
                <th className="px-3 py-2 text-right">Discount</th>
                <th className="px-3 py-2 text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.productName}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice, "PKR")}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(item.itemDiscount, "PKR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(item.lineSubtotal, "PKR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(sale.subtotal, "PKR")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span>-{formatCurrency(sale.discount, "PKR")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(sale.tax, "PKR")}</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(sale.total, "PKR")}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">Thank you for your purchase.</p>
      </CardContent>
    </Card>
  );
}
