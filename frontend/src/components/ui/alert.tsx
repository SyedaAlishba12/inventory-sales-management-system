import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const alertVariants = cva("relative w-full rounded-xl border p-4", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      info: "border-blue-200 bg-blue-50 text-blue-950",
      success: "border-green-200 bg-green-50 text-green-950",
      warning: "border-amber-200 bg-amber-50 text-amber-950",
      destructive: "border-red-200 bg-red-50 text-red-950",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-semibold leading-none", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm leading-relaxed opacity-90", className)} {...props} />;
}
