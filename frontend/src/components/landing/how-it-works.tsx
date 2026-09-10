import { BarChart3, PackagePlus, ScanLine } from "lucide-react";

const steps = [
  { number: "01", title: "Add your business data", description: "Create products, categories, customers, suppliers, users, and opening stock.", icon: PackagePlus },
  { number: "02", title: "Run daily operations", description: "Complete POS sales and purchase orders while inventory updates automatically.", icon: ScanLine },
  { number: "03", title: "Act on clear insights", description: "Monitor low stock, activity, revenue, profit, trends, and downloadable reports.", icon: BarChart3 },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">Simple from day one</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">From setup to insight in three steps</h2>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">A straightforward workflow keeps every team member focused on their job.</p>
        </div>
        <ol className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <div className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-teal-500/60 to-transparent lg:block" aria-hidden="true" />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <div className="flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300"><Icon className="size-6" /></span><span className="text-3xl font-black text-white/10">{step.number}</span></div>
                <h3 className="mt-6 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
