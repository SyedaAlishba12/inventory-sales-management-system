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
    <div className="space-y-3 rounded-xl bg-[#EAF0F2] p-4 text-sm"> 
      <div className="flex justify-between gap-4 text-[#52646A]"><span>Subtotal</span><span>{money(subtotal)}</span></div> 
      <div className="flex justify-between gap-4 text-[#52646A]"><span>Discount</span><span>-{money(discount)}</span></div> 
      <div className="flex justify-between gap-4 text-[#52646A]"><span>Tax</span><span>{money(tax)}</span></div> 
      <Separator /> 
      <div className="flex items-end justify-between gap-4"> 
        <span className="font-semibold text-[#0F4C5C]">Total</span> 
        <span className="text-xl font-bold text-[#0F4C5C]">{money(total)}</span> 
      </div> 
      {amountPaid !== undefined ? ( 
        <> 
          <div className="flex justify-between gap-4 text-[#52646A]"><span>Amount paid</span><span>{money(amountPaid)}</span></div> 
          <div className="flex justify-between gap-4 font-semibold text-[#0F4C5C]"><span>{(balance || 0) >= 0 ? "Change" : "Balance due"}</span><span>{money(Math.abs(balance || 0))}</span></div> 
        </> 
      ) : null} 
    </div> 
  ); 
}