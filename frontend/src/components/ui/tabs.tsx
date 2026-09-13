"use client"; 
 
import * as TabsPrimitive from "@radix-ui/react-tabs"; 
import type { ComponentProps } from "react"; 
 
import { cn } from "@/utils/cn"; 
 
export const Tabs = TabsPrimitive.Root; 
 
export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) { 
  return <TabsPrimitive.List className={cn("inline-flex h-10 items-center rounded-lg bg-[#EAF0F2] p-1", className)} {...props} />; 
} 
 
export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) { 
  return ( 
    <TabsPrimitive.Trigger 
      className={cn( 
        "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-[#7A8B91] outline-none transition focus-visible:ring-2 focus-visible:ring-[#78A394] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-[#0F4C5C] data-[state=active]:shadow-sm", 
        className, 
      )} 
      {...props} 
    /> 
  ); 
} 
 
export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) { 
  return <TabsPrimitive.Content className={cn("mt-4 outline-none focus-visible:ring-2 focus-visible:ring-[#78A394]", className)} {...props} />; 
} 