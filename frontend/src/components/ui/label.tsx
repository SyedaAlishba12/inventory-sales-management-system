"use client"; 
 
import * as LabelPrimitive from "@radix-ui/react-label"; 
import type { ComponentProps } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) { 
  return ( 
    <LabelPrimitive.Root 
      className={cn( 
        "text-sm font-medium leading-none text-[#0F4C5C] peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
        className, 
      )} 
      {...props} 
    /> 
  ); 
} 