"use client"; 
 
import { Banknote, CreditCard, Globe2, type LucideIcon } from "lucide-react"; 
 
import { PAYMENT_METHODS } from "@/constants"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import type { PaymentMethod } from "@/types"; 
import { cn } from "@/utils/cn"; 
 
const paymentIcons: Record<PaymentMethod, LucideIcon> = { 
  cash: Banknote, 
  card: CreditCard, 
  online: Globe2, 
}; 
 
interface PaymentSelectorProps { 
  value: PaymentMethod; 
  onChange: (method: PaymentMethod) => void; 
  disabled?: boolean; 
} 
 
export function PaymentSelector({ disabled, onChange, value }: PaymentSelectorProps) { 
  return ( 
    <RadioGroup value={value} onValueChange={(method) => onChange(method as PaymentMethod)} disabled={disabled} className="grid gap-3 sm:grid-cols-3"> 
      {PAYMENT_METHODS.map((method) => { 
        const Icon = paymentIcons[method.value]; 
        const selected = value === method.value; 
        return ( 
          <label 
            key={method.value} 
            className={cn( 
              "flex cursor-pointer items-start gap-3 rounded-xl border border-[#D7E0E3] bg-card p-3 transition hover:bg-[#EAF0F2]", 
              selected && "border-[#0F4C5C] bg-[#78A394]/10 ring-1 ring-[#0F4C5C]", 
              disabled && "cursor-not-allowed opacity-50", 
            )} 
          > 
            <RadioGroupItem value={method.value} className="mt-0.5" /> 
            <span> 
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0F4C5C]"><Icon className="size-4" />{method.label}</span> 
              <span className="mt-1 block text-xs leading-relaxed text-[#52646A]">{method.description}</span> 
            </span> 
          </label> 
        ); 
      })} 
    </RadioGroup> 
  ); 
} 