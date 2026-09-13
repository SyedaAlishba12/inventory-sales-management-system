"use client";  
  
import Link from "next/link";  
import { usePathname } from "next/navigation";  
  
import { AppLogo } from "@/components/shared/app-logo";  
import { Badge } from "@/components/ui/badge";  
import { defaultNavigation, type NavigationGroup } from "@/components/layout/navigation";  
import { cn } from "@/utils/cn";  
  
interface SidebarContentProps {  
  navigation?: NavigationGroup[];  
  onNavigate?: () => void;  
}  
  
export function SidebarContent({ navigation = defaultNavigation, onNavigate }: SidebarContentProps) {  
  const pathname = usePathname();  
  
  return (  
    <div className="flex h-full flex-col bg-[#EAF0F2]">  
      <div className="flex h-20 items-center border-b border-[#D7E0E3] px-5">  
        <AppLogo href="/dashboard" />  
      </div>  
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main navigation">  
        {navigation.map((group) => (  
          <div key={group.label}>  
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A8B91]">  
              {group.label}  
            </p>  
            <div className="space-y-1">  
              {group.items.map((item) => {  
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);  
                const Icon = item.icon;  
  
                return (  
                  <Link  
                    key={item.href}  
                    href={item.href}  
                    onClick={onNavigate}  
                    aria-current={active ? "page" : undefined}  
                    className={cn(  
                      "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#52646A] outline-none transition hover:bg-white/70 hover:text-[#0F4C5C] focus-visible:ring-2 focus-visible:ring-[#78A394]",  
                      active && "bg-[#0F4C5C] text-white hover:bg-[#0F4C5C] hover:text-white",  
                    )}  
                  >  
                    <Icon className="size-[18px]" aria-hidden="true" />  
                    <span>{item.label}</span>  
                  </Link>  
                );  
              })}  
            </div>  
          </div>  
        ))}  
      </nav>  
      <div className="border-t border-[#D7E0E3] p-4">  
        <div className="rounded-xl bg-[#0F4C5C] p-4 text-white">  
          <div className="flex items-center justify-between gap-2">  
            <p className="text-sm font-semibold">System status</p>  
            <Badge className="bg-[#52B788]/15 text-[#52B788] ring-[#52B788]/20">Online</Badge>  
          </div>  
          <p className="mt-2 text-xs leading-relaxed text-white/70">  
            Inventory and sales services are available.  
          </p>  
        </div>  
      </div>  
    </div>  
  );  
}  
  
export function Sidebar({ className, navigation }: { className?: string; navigation?: NavigationGroup[] }) {  
  return (  
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#D7E0E3] lg:block", className)}>  
      <SidebarContent navigation={navigation} />  
    </aside>  
  );  
}  