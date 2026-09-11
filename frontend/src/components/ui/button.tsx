"use client"; 
 
import { Slot } from "@radix-ui/react-slot"; 
import { cva, type VariantProps } from "class-variance-authority"; 
import type { ButtonHTMLAttributes } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
export const buttonVariants = cva( 
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78A394] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", 
  { 
    variants: { 
      variant: { 
        default: "bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90", 
        secondary: "bg-[#EAF0F2] text-[#0F4C5C] hover:bg-[#D7E0E3]", 
        outline: "border border-[#D7E0E3] bg-card text-[#0F4C5C] hover:bg-[#EAF0F2]", 
        ghost: "text-[#0F4C5C] hover:bg-[#EAF0F2]", 
        destructive: "bg-[#E67E72] text-white hover:bg-[#E67E72]/90", 
        link: "text-[#0F4C5C] underline-offset-4 hover:underline", 
      }, 
      size: { 
        sm: "h-8 px-3", 
        default: "h-10 px-4", 
        lg: "h-12 px-6 text-base", 
        icon: "size-10 p-0", 
      }, 
    }, 
    defaultVariants: { 
      variant: "default", 
      size: "default", 
    }, 
  }, 
); 
 
export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>, 
    VariantProps<typeof buttonVariants> { 
  asChild?: boolean; 
} 
 
export function Button({ 
  asChild = false, 
  className, 
  size, 
  variant, 
  type = "button", 
  ...props 
}: ButtonProps) { 
  const Component = asChild ? Slot : "button"; 
 
  return ( 
    <Component 
      className={cn(buttonVariants({ size, variant }), className)} 
      type={asChild ? undefined : type} 
      {...props} 
    /> 
  ); 
} 