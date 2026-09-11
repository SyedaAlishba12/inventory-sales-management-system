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
  { title: "Product management", description: "Organize products, SKUs, categories, prices, costs, images, and stock thresholds in one catalog.", icon: PackageSearch, accent: "bg-[#78A394]/15 text-[#0F4C5C]" }, 
  { title: "Real-time inventory", description: "Track stock in, stock out, damaged goods, adjustments, and every movement automatically.", icon: Boxes, accent: "bg-[#78A394]/15 text-[#0F4C5C]" }, 
  { title: "Fast POS and sales", description: "Search products, build carts, apply discounts and tax, accept payments, and generate receipts.", icon: ShoppingCart, accent: "bg-[#70588C]/15 text-[#70588C]" }, 
  { title: "Customer insights", description: "Keep contact details, purchase history, visit counts, and total customer spending accessible.", icon: ContactRound, accent: "bg-[#70588C]/15 text-[#70588C]" }, 
  { title: "Suppliers and purchases", description: "Manage suppliers, purchase orders, payment status, costs, and incoming inventory.", icon: Truck, accent: "bg-[#E67E72]/15 text-[#E67E72]" }, 
  { title: "Reports that explain", description: "Understand sales, profit, inventory, customers, and suppliers with filters and exports.", icon: BarChart3, accent: "bg-[#70588C]/15 text-[#70588C]" }, 
]; 
 
export function FeaturesSection() { 
  return ( 
    <section id="features" className="bg-background py-20 sm:py-24"> 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> 
        <div className="mx-auto max-w-3xl text-center"> 
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F4C5C]">Everything connected</p> 
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[#0F4C5C] sm:text-4xl">One system for every daily operation</h2> 
          <p className="mt-4 text-pretty text-base leading-7 text-[#52646A] sm:text-lg">Replace scattered spreadsheets and disconnected tools with a clear workflow your whole team can follow.</p> 
        </div> 
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"> 
          {features.map((feature) => { 
            const Icon = feature.icon; 
            return ( 
              <Card key={feature.title} className="group border-[#D7E0E3] bg-card transition duration-300 hover:-translate-y-1 hover:border-[#78A394] hover:shadow-lg"> 
                <CardContent className="p-6"> 
                  <div className={`flex size-12 items-center justify-center rounded-xl ${feature.accent}`}><Icon className="size-6" /></div> 
                  <h3 className="mt-5 text-lg font-bold text-[#0F4C5C]">{feature.title}</h3> 
                  <p className="mt-2 text-sm leading-6 text-[#52646A]">{feature.description}</p> 
                </CardContent> 
              </Card> 
            ); 
          })} 
        </div> 
      </div> 
    </section> 
  ); 
}  