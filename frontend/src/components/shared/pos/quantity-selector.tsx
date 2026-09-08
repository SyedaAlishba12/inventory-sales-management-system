"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({ disabled, max = Number.MAX_SAFE_INTEGER, min = 1, onChange, value }: QuantitySelectorProps) {
  const update = (nextValue: number) => onChange(Math.min(max, Math.max(min, nextValue)));

  return (
    <div className="inline-flex items-center rounded-lg border bg-card" aria-label="Quantity selector">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-r-none"
        disabled={disabled || value <= min}
        onClick={() => update(value - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => update(Number(event.target.value) || min)}
        aria-label="Quantity"
        className="h-8 w-12 rounded-none border-y-0 px-1 text-center shadow-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-l-none"
        disabled={disabled || value >= max}
        onClick={() => update(value + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
