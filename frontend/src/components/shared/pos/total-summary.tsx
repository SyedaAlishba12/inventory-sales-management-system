import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currency";

interface TotalSummaryProps {
  subtotal: number;
  discount?: number;
  tax?: number;
  amountPaid?: number;
  currency?: string;
}

export function TotalSummary({ amountPaid, currency = "PKR", discount = 0, subtotal, tax = 0 }: TotalSummaryProps) {
  const total = Math.max(0, subtotal - discount + tax);
  const balance = amountPaid === undefined ? undefined : amountPaid - total;
  const money = (value: number) => formatCurrency(value, currency);

  return (
    <div className="space-y-3 rounded-xl bg-muted/70 p-4 text-sm">
      <div className="flex justify-between gap-4 text-muted-foreground"><span>Subtotal</span><span>{money(subtotal)}</span></div>
      <div className="flex justify-between gap-4 text-muted-foreground"><span>Discount</span><span>-{money(discount)}</span></div>
      <div className="flex justify-between gap-4 text-muted-foreground"><span>Tax</span><span>{money(tax)}</span></div>
      <Separator />
      <div className="flex items-end justify-between gap-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-primary">{money(total)}</span>
      </div>
      {amountPaid !== undefined ? (
        <>
          <div className="flex justify-between gap-4 text-muted-foreground"><span>Amount paid</span><span>{money(amountPaid)}</span></div>
          <div className="flex justify-between gap-4 font-semibold"><span>{(balance || 0) >= 0 ? "Change" : "Balance due"}</span><span>{money(Math.abs(balance || 0))}</span></div>
        </>
      ) : null}
    </div>
  );
}
