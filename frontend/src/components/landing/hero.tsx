import { ArrowRight, CheckCircle2, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const chartBars = [42, 57, 48, 69, 61, 82, 73, 92, 78, 96, 86, 100];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
      <div className="absolute -inset-10 -z-10 rounded-full bg-teal-300/20 blur-3xl" />
      <Card className="overflow-hidden border-white/80 bg-white/95 shadow-2xl shadow-slate-900/15">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
          </div>
          <Badge variant="success">Live overview</Badge>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Today&apos;s sales</p>
            <p className="mt-1 text-xl font-bold text-slate-950">Rs 84,250</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700"><TrendingUp className="size-3.5" />12.8%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Products</p>
            <p className="mt-1 text-xl font-bold text-slate-950">1,248</p>
            <p className="mt-1 text-xs text-slate-500">Across 28 categories</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700">Low stock</p>
            <p className="mt-1 text-xl font-bold text-amber-950">12 items</p>
            <p className="mt-1 text-xs text-amber-700">Needs attention</p>
          </div>
        </div>
        <div className="grid gap-4 px-4 pb-4 sm:grid-cols-[1fr_13rem] sm:px-5 sm:pb-5">
          <div className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-semibold">Monthly revenue</p><p className="text-xs text-muted-foreground">Last 12 months</p></div>
              <p className="text-sm font-bold text-primary">Rs 1.82M</p>
            </div>
            <div className="mt-5 flex h-32 items-end gap-1.5" aria-label="Revenue chart preview">
              {chartBars.map((height, index) => (
                <span key={index} className="flex-1 rounded-t bg-teal-600/80" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-slate-900 p-4 text-white">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10"><PackageCheck className="size-5 text-teal-300" /></div>
            <p className="mt-4 text-sm font-semibold">Inventory synced</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">Every sale and purchase updates stock automatically.</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-teal-400" /></div>
          </div>
        </div>
      </Card>
      <div className="absolute -right-3 -bottom-5 hidden items-center gap-3 rounded-xl border bg-white p-3 shadow-xl sm:flex">
        <span className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-700"><ShieldCheck className="size-5" /></span>
        <span><span className="block text-sm font-bold">Roles protected</span><span className="block text-xs text-muted-foreground">Admin and staff access</span></span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-0 size-[44rem] -translate-x-1/2 rounded-full bg-teal-200/25 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <div className="text-center lg:text-left">
          <Badge className="mb-6 px-3 py-1 text-sm">One workspace. Complete business control.</Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Run inventory and sales with <span className="text-primary">clarity.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
            Inventra connects products, stock, POS, customers, suppliers, purchases, and reports—so your team always knows what is selling and what needs attention.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg"><Link href={siteConfig.links.signup}>Start managing free<ArrowRight className="size-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><a href="#how-it-works">See how it works</a></Button>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600 lg:justify-start">
            {['Fast setup', 'Responsive on every device', 'Admin and staff roles'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" />{item}</span>
            ))}
          </div>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}
