import { cva, type VariantProps } from "class-variance-authority"; 
import type { HTMLAttributes } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
const badgeVariants = cva( 
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", 
  { 
    variants: { 
      variant: { 
        default: "bg-[#78A394]/15 text-[#0F4C5C] ring-[#78A394]/20", 
        secondary: "bg-[#EAF0F2] text-[#52646A] ring-[#D7E0E3]", 
        success: "bg-[#52B788]/15 text-[#52B788] ring-[#52B788]/20", 
        warning: "bg-[#E67E72]/15 text-[#E67E72] ring-[#E67E72]/20", 
        destructive: "bg-[#E67E72]/15 text-[#E67E72] ring-[#E67E72]/20", 
        outline: "bg-transparent text-[#0F4C5C] ring-[#D7E0E3]", 
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