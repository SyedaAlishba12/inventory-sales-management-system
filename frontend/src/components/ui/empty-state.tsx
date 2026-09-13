import { PackageOpen, type LucideIcon } from "lucide-react"; 
import type { ReactNode } from "react"; 
 
interface EmptyStateProps { 
  title: string; 
  description: string; 
  action?: ReactNode; 
  icon?: LucideIcon; 
} 
 
export function EmptyState({ action, description, icon: Icon = PackageOpen, title }: EmptyStateProps) { 
  return ( 
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#D7E0E3] bg-card px-6 py-12 text-center"> 
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#78A394]/15 text-[#0F4C5C]"> 
        <Icon className="size-6" aria-hidden="true" /> 
      </div> 
      <h3 className="text-base font-semibold text-[#0F4C5C]">{title}</h3> 
      <p className="mt-1 max-w-sm text-sm text-[#52646A]">{description}</p> 
      {action ? <div className="mt-5">{action}</div> : null} 
    </div> 
  ); 
} 