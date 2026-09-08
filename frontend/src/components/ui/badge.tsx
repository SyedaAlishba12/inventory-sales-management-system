import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-teal-50 text-teal-700 ring-teal-600/20",
        secondary: "bg-slate-100 text-slate-700 ring-slate-600/20",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
        destructive: "bg-red-50 text-red-700 ring-red-600/20",
        outline: "bg-transparent text-foreground ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
