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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#D7E0E3] bg-white px-4 text-[#0F4C5C] backdrop-blur sm:px-6"> 
      <Button variant="ghost" size="icon" className="text-[#52646A] hover:bg-[#EAF0F2] hover:text-[#0F4C5C] lg:hidden" onClick={onMenuClick} aria-label="Open navigation"> 
        <Menu className="size-5" /> 
      </Button> 
      <div className="relative hidden w-full max-w-md sm:block"> 
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7A8B91]" /> 
        <Input className="border-[#D7E0E3] bg-[#F3F6F8] pl-9 text-[#0F4C5C] shadow-none placeholder:text-[#7A8B91] focus-visible:ring-[#78A394]" placeholder="Search products, sales, customers..." aria-label="Global search" /> 
      </div> 
      <div className="ml-auto flex items-center gap-1 sm:gap-3"> 
        <Button asChild variant="ghost" size="icon" className="relative text-[#52646A] hover:bg-[#EAF0F2] hover:text-[#0F4C5C]"> 
          <Link href="/notifications" aria-label="Notifications"> 
            <Bell className="size-5" /> 
            <span className="absolute top-2 right-2 size-2 rounded-full bg-[#E67E72] ring-2 ring-white" /> 
          </Link> 
        </Button> 
        <UserMenu /> 
      </div> 
    </header> 
  ); 
} 