"use client"; 
 
import { Package, Trash2 } from "lucide-react"; 
 
import { QuantitySelector } from "@/components/shared/pos/quantity-selector"; 
import { Button } from "@/components/ui/button"; 
import type { CartLine } from "@/types"; 
import { formatCurrency } from "@/utils/currency"; 
 
interface CartItemProps { 
  item: CartLine; 
  onQuantityChange: (quantity: number) => void; 
  onRemove: () => void; 
  disabled?: boolean; 
} 
 
export function CartItem({ disabled, item, onQuantityChange, onRemove }: CartItemProps) { 
  return ( 
    <div className="flex gap-3 rounded-xl border border-[#D7E0E3] bg-card p-3"> 
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF0F2]"> 
        {item.imageUrl ? ( 
          // eslint-disable-next-line @next/next/no-img-element 
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="size-full object-cover" /> 
        ) : ( 
          <Package className="size-6 text-[#7A8B91]" /> 
        )} 
      </div> 
      <div className="min-w-0 flex-1"> 
        <div className="flex items-start justify-between gap-2"> 
          <div className="min-w-0"> 
            <p className="truncate text-sm font-semibold text-[#0F4C5C]">{item.name}</p> 
            <p className="mt-0.5 text-xs text-[#7A8B91]">{item.sku}</p> 
          </div> 
          <Button variant="ghost" size="icon" className="size-8 shrink-0 text-[#7A8B91] hover:bg-[#E67E72]/10 hover:text-[#E67E72]" onClick={onRemove} disabled={disabled} aria-label={`Remove ${item.name}`}> 
            <Trash2 className="size-4" /> 
          </Button> 
        </div> 
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"> 
          <QuantitySelector value={item.quantity} min={1} max={item.availableStock} onChange={onQuantityChange} disabled={disabled} /> 
          <div className="text-right"> 
            <p className="text-sm font-bold text-[#0F4C5C]">{formatCurrency(item.unitPrice * item.quantity)}</p> 
            <p className="text-xs text-[#7A8B91]">{formatCurrency(item.unitPrice)} each</p> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
} 