"use client";

import { useState, type ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import type { NavigationGroup } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/utils/cn";

interface MainLayoutProps {
  children: ReactNode;
  navigation?: NavigationGroup[];
  contentClassName?: string;
}

export function MainLayout({ children, contentClassName, navigation }: MainLayoutProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar navigation={navigation} />
      <MobileNavigation
        navigation={navigation}
        open={mobileNavigationOpen}
        onOpenChange={setMobileNavigationOpen}
      />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setMobileNavigationOpen(true)} />
        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8", contentClassName)}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
