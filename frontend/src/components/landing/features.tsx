import {
  BarChart3,
  Boxes,
  ContactRound,
  PackageSearch,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features: Array<{ title: string; description: string; icon: LucideIcon; accent: string }> = [
  { title: "Product management", description: "Organize products, SKUs, categories, prices, costs, images, and stock thresholds in one catalog.", icon: PackageSearch, accent: "bg-blue-50 text-blue-700" },
  { title: "Real-time inventory", description: "Track stock in, stock out, damaged goods, adjustments, and every movement automatically.", icon: Boxes, accent: "bg-teal-50 text-teal-700" },
  { title: "Fast POS and sales", description: "Search products, build carts, apply discounts and tax, accept payments, and generate receipts.", icon: ShoppingCart, accent: "bg-violet-50 text-violet-700" },
  { title: "Customer insights", description: "Keep contact details, purchase history, visit counts, and total customer spending accessible.", icon: ContactRound, accent: "bg-rose-50 text-rose-700" },
  { title: "Suppliers and purchases", description: "Manage suppliers, purchase orders, payment status, costs, and incoming inventory.", icon: Truck, accent: "bg-amber-50 text-amber-700" },
  { title: "Reports that explain", description: "Understand sales, profit, inventory, customers, and suppliers with filters and exports.", icon: BarChart3, accent: "bg-emerald-50 text-emerald-700" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Everything connected</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">One system for every daily operation</h2>
          <p className="mt-4 text-pretty text-base leading-7 text-slate-600 sm:text-lg">Replace scattered spreadsheets and disconnected tools with a clear workflow your whole team can follow.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className={`flex size-12 items-center justify-center rounded-xl ${feature.accent}`}><Icon className="size-6" /></div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
