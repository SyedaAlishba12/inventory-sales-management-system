"use client";

import { CalendarDays } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ className, disabled, label, max, min, onChange, value = "" }: DatePickerProps) {
  const inputId = useId();
  const input = (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={inputId}
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        aria-label={label || "Select date"}
      />
    </div>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      {input}
    </div>
  );
}
