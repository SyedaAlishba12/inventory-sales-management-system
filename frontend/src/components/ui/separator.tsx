import type { HTMLAttributes } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
interface SeparatorProps extends HTMLAttributes<HTMLDivElement> { 
  orientation?: "horizontal" | "vertical"; 
} 
 
export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) { 
  return ( 
    <div 
      role="separator" 
      aria-orientation={orientation} 
      className={cn( 
        "shrink-0 bg-[#D7E0E3]", 
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px", 
        className, 
      )} 
      {...props} 
    /> 
  ); 
} 