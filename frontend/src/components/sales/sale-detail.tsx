import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { humanize } from "@/utils/format";
import type { SaleSummary } from "@/types/sale";

interface SaleDetailProps {
  sale: SaleSummary;
}

export function SaleDetail({ sale }: SaleDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Invoice number" value={sale.invoiceNumber} />
          <Field label="Sale date" value={formatDateTime(sale.saleDate)} />
          <Field
            label="Customer"
            value={sale.customerId ? String(sale.customerId) : "Walk-in customer"}
          />
          <Field label="Payment method" value={humanize(sale.paymentMethod)} />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={sale.status} />
            </div>
          </div>
          <Field label="Discount" value={formatCurrency(sale.discount, "PKR")} />
          <Field label="Tax" value={formatCurrency(sale.tax, "PKR")} />
          <Field label="Final total" value={formatCurrency(sale.total, "PKR")} emphasis />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Sale items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-2">Product</th>
                  <th className="px-5 py-2 text-right">Qty</th>
                  <th className="px-5 py-2 text-right">Unit price</th>
                  <th className="px-5 py-2 text-right">Discount</th>
                  <th className="px-5 py-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2.5">{String(item.productId)}</td>
                    <td className="px-5 py-2.5 text-right">{item.quantity}</td>
                    <td className="px-5 py-2.5 text-right">
                      {formatCurrency(item.unitPrice, "PKR")}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {formatCurrency(item.itemDiscount, "PKR")}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium">
                      {formatCurrency(item.lineSubtotal, "PKR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={emphasis ? "mt-1 text-base font-bold" : "mt-1 text-sm font-medium"}>{value}</p>
    </div>
  );
}
