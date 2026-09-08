"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useState, type ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-card shadow-sm",
      },
      size: {
        sm: "h-8 px-2.5",
        default: "h-10 px-3",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ToggleProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export function Toggle({
  className,
  defaultPressed = false,
  onClick,
  onPressedChange,
  pressed,
  size,
  variant,
  ...props
}: ToggleProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isPressed = pressed ?? internalPressed;

  return (
    <button
      type="button"
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      className={cn(toggleVariants({ size, variant }), className)}
      onClick={(event) => {
        if (pressed === undefined) setInternalPressed(!isPressed);
        onPressedChange?.(!isPressed);
        onClick?.(event);
      }}
      {...props}
    />
  );
}
