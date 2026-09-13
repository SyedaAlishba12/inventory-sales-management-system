import type { TextareaHTMLAttributes } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { 
  return ( 
    <textarea 
      className={cn( 
        "min-h-24 w-full resize-y rounded-lg border border-[#D7E0E3] bg-card px-3 py-2 text-sm text-[#0F4C5C] shadow-sm outline-none transition placeholder:text-[#7A8B91] focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20 disabled:cursor-not-allowed disabled:bg-[#EAF0F2] disabled:opacity-70 aria-invalid:border-[#E67E72] aria-invalid:ring-[#E67E72]/20", 
        className, 
      )} 
      {...props} 
    /> 
  ); 
} 