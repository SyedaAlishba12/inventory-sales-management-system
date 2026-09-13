import Link from "next/link"; 
 
import { AppLogo } from "@/components/shared/app-logo"; 
import { siteConfig } from "@/config/site"; 
 
const productLinks = [ 
  { label: "Features", href: "#features" }, 
  { label: "Benefits", href: "#benefits" }, 
  { label: "How it works", href: "#how-it-works" }, 
]; 
 
export function LandingFooter() { 
  return ( 
    <footer className="border-t border-[#D7E0E3] bg-background"> 
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8"> 
        <div> 
          <AppLogo /> 
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#52646A]">Connected inventory and sales management for growing small and medium-sized businesses.</p> 
        </div> 
        <div> 
          <h2 className="text-sm font-bold text-[#0F4C5C]">Product</h2> 
          <ul className="mt-4 space-y-3 text-sm text-[#52646A]">{productLinks.map((link) => <li key={link.href}><a href={link.href} className="hover:text-[#0F4C5C]">{link.label}</a></li>)}</ul> 
        </div> 
        <div> 
          <h2 className="text-sm font-bold text-[#0F4C5C]">Account</h2> 
          <ul className="mt-4 space-y-3 text-sm text-[#52646A]"><li><Link href={siteConfig.links.login} className="hover:text-[#0F4C5C]">Log in</Link></li><li><Link href={siteConfig.links.signup} className="hover:text-[#0F4C5C]">Create account</Link></li></ul> 
        </div> 
      </div> 
      <div className="border-t border-[#D7E0E3]"> 
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[#7A8B91] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"> 
          <p>© {new Date().getFullYear()} Inventra. All rights reserved.</p> 
          <p>Inventory • Sales • Better decisions</p> 
        </div> 
      </div> 
    </footer> 
  ); 
}  