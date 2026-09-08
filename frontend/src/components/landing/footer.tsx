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
    <footer className="border-t bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <AppLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Connected inventory and sales management for growing small and medium-sized businesses.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-950">Product</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">{productLinks.map((link) => <li key={link.href}><a href={link.href} className="hover:text-primary">{link.label}</a></li>)}</ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-950">Account</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600"><li><Link href={siteConfig.links.login} className="hover:text-primary">Log in</Link></li><li><Link href={siteConfig.links.signup} className="hover:text-primary">Create account</Link></li></ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Inventra. All rights reserved.</p>
          <p>Inventory • Sales • Better decisions</p>
        </div>
      </div>
    </footer>
  );
}
