import { Check, Clock3, Eye, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  "Automatic stock updates after every sale and purchase",
  "Low-stock alerts before popular products run out",
  "Complete activity history for important team actions",
  "Role-based access for administrators and staff",
  "Responsive workflows for desktop, tablet, and mobile",
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-8 -z-10 rounded-full bg-teal-100/60 blur-3xl" />
          <Card className="relative overflow-hidden border-slate-200 shadow-xl">
            <div className="border-b bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wider text-teal-300">Operations health</p><p className="mt-1 text-xl font-bold">Everything under control</p></div><Badge className="bg-white/10 text-white ring-white/20">Today</Badge></div>
            </div>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl border p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Eye className="size-5" /></span><p className="mt-4 text-2xl font-bold">100%</p><p className="text-sm text-muted-foreground">Stock visibility</p></div>
              <div className="rounded-xl border p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Clock3 className="size-5" /></span><p className="mt-4 text-2xl font-bold">Hours</p><p className="text-sm text-muted-foreground">Saved each week</p></div>
              <div className="rounded-xl border p-4 sm:col-span-2">
                <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-700"><ShieldCheck className="size-5" /></span><div><p className="font-semibold">Accountability built in</p><p className="text-sm text-muted-foreground">Important actions are recorded with user and time.</p></div></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="order-1 lg:order-2">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-primary"><Sparkles className="size-4" />Why Inventra</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Make better decisions without chasing the numbers</h2>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">Your sales, inventory, customers, and purchases should tell one consistent story. Inventra keeps that information connected and ready when you need it.</p>
          <ul className="mt-7 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-slate-700 sm:text-base"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-primary"><Check className="size-3.5" strokeWidth={3} /></span>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
