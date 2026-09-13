"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#D7E0E3] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <AppLogo />
        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Landing page navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="rounded-lg px-4 py-2 text-sm font-medium text-[#52646A] outline-none transition hover:bg-[#EAF0F2] hover:text-[#0F4C5C] focus-visible:ring-2 focus-visible:ring-[#78A394]">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <Button asChild variant="ghost"><Link href={siteConfig.links.login}>Log in</Link></Button>
          <Button asChild><Link href={siteConfig.links.signup}>Start free</Link></Button>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto sm:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
          <Menu className="size-5" />
        </Button>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent aria-describedby={undefined} className="top-0 right-0 left-auto h-dvh w-[min(22rem,88vw)] max-w-none translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 p-0 sm:hidden">
          <DialogTitle className="sr-only">Landing page navigation</DialogTitle>
          <div className="flex h-full flex-col bg-[#EAF0F2]">
            <div className="flex h-18 items-center border-b border-[#D7E0E3] px-5"><AppLogo /></div>
            <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile landing page navigation">
              {navigation.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold text-[#0F4C5C] outline-none transition hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#78A394]">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="grid gap-2 border-t border-[#D7E0E3] p-4">
              <Button asChild variant="outline" size="lg"><Link href={siteConfig.links.login}>Log in</Link></Button>
              <Button asChild size="lg"><Link href={siteConfig.links.signup}>Create account</Link></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}