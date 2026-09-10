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
    <div className="flex gap-3 rounded-xl border bg-card p-3">
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <Package className="size-6 text-slate-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.sku}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:bg-red-50 hover:text-danger" onClick={onRemove} disabled={disabled} aria-label={`Remove ${item.name}`}>
            <Trash2 className="size-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector value={item.quantity} min={1} max={item.availableStock} onChange={onQuantityChange} disabled={disabled} />
          <div className="text-right">
            <p className="text-sm font-bold">{formatCurrency(item.unitPrice * item.quantity)}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
          </div>
        </div>
      </div>
    </div>
  );
}
