import { cva, type VariantProps } from "class-variance-authority"; 
import type { HTMLAttributes } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
const alertVariants = cva("relative w-full rounded-xl border p-4", { 
  variants: { 
    variant: { 
      default: "bg-card text-card-foreground border-[#D7E0E3]", 
      info: "border-[#70588C]/30 bg-[#70588C]/10 text-[#70588C]", 
      success: "border-[#52B788]/30 bg-[#52B788]/10 text-[#52B788]", 
      warning: "border-[#E67E72]/30 bg-[#E67E72]/10 text-[#E67E72]", 
      destructive: "border-[#E67E72]/30 bg-[#E67E72]/10 text-[#E67E72]", 
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