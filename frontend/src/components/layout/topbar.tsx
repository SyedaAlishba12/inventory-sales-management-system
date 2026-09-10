"use client";

import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";

import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      <div className="relative hidden w-full max-w-md sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="bg-muted/70 pl-9 shadow-none" placeholder="Search products, sales, customers..." aria-label="Global search" />
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-danger ring-2 ring-card" />
          </Link>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
