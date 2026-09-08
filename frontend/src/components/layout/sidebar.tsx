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
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-20 items-center border-b px-5">
        <AppLogo href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
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
                      "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-accent text-accent-foreground",
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
      <div className="border-t p-4">
        <div className="rounded-xl bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">System status</p>
            <Badge className="bg-emerald-400/15 text-emerald-300 ring-emerald-400/20">Online</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Inventory and sales services are available.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ className, navigation }: { className?: string; navigation?: NavigationGroup[] }) {
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block", className)}>
      <SidebarContent navigation={navigation} />
    </aside>
  );
}
