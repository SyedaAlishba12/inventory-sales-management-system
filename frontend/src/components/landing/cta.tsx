import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function CallToActionSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-700 to-slate-900 px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-16">
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-28 size-80 rounded-full bg-teal-300/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Ready to bring every business operation together?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-teal-50 sm:text-lg">Create your account and give your team one reliable place to manage inventory, sales, customers, purchases, and reports.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-teal-800 hover:bg-teal-50"><Link href={siteConfig.links.signup}>Create your account<ArrowRight className="size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10"><Link href={siteConfig.links.login}>Sign in</Link></Button>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-teal-100"><CheckCircle2 className="size-4" />Built for desktop, tablet, and mobile</p>
          </div>
        </div>
      </div>
    </section>
  );
}
