"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MainLayout, PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const monthlyPerformance = [
  { month: "Jan", sales: 92, purchases: 58 },
  { month: "Feb", sales: 118, purchases: 76 },
  { month: "Mar", sales: 105, purchases: 68 },
  { month: "Apr", sales: 146, purchases: 91 },
  { month: "May", sales: 132, purchases: 82 },
  { month: "Jun", sales: 168, purchases: 104 },
  { month: "Jul", sales: 152, purchases: 96 },
];

const inventoryItems = [
  {
    name: "Wireless Mouse",
    sku: "MOUSE-001",
    stock: 87,
    minimum: 20,
    status: "Healthy",
  },
  {
    name: "Mechanical Keyboard",
    sku: "KEY-014",
    stock: 12,
    minimum: 15,
    status: "Low",
  },
  {
    name: "USB-C Cable",
    sku: "CAB-108",
    stock: 63,
    minimum: 20,
    status: "Healthy",
  },
  {
    name: "Laptop Stand",
    sku: "STAND-022",
    stock: 7,
    minimum: 10,
    status: "Low",
  },
  {
    name: "Wireless Headphones",
    sku: "HEAD-031",
    stock: 46,
    minimum: 15,
    status: "Healthy",
  },
];

const recentSales = [
  {
    invoice: "INV-1048",
    customer: "Ayesha Khan",
    amount: "Rs 8,450",
    method: "Card",
    status: "Completed",
  },
  {
    invoice: "INV-1047",
    customer: "Usman Ali",
    amount: "Rs 5,280",
    method: "Cash",
    status: "Completed",
  },
  {
    invoice: "INV-1046",
    customer: "Hira Ahmed",
    amount: "Rs 12,750",
    method: "Online",
    status: "Completed",
  },
  {
    invoice: "INV-1045",
    customer: "Bilal Shah",
    amount: "Rs 3,920",
    method: "Cash",
    status: "Completed",
  },
];

const lowStockItems = [
  {
    name: "Mechanical Keyboard",
    stock: 3,
    minimum: 5,
  },
  {
    name: "USB-C Cable",
    stock: 6,
    minimum: 10,
  },
  {
    name: "Laptop Stand",
    stock: 2,
    minimum: 8,
  },
];

function Trend({
  value,
  positive = true,
}: {
  value: string;
  positive?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        positive ? "text-[#52B788]" : "text-[#E67E72]"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="size-3.5" aria-hidden="true" />
      )}
      {value}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  trend,
  positive = true,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof CircleDollarSign;
  accent: string;
  trend?: string;
  positive?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>

          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${accent}18`,
              color: accent,
            }}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {trend ? <Trend value={trend} positive={positive} /> : null}
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your business performance and daily operations."
          actions={
            <Button asChild>
              <Link href="/pos">
                <ShoppingCart className="size-4" />
                New Sale
              </Link>
            </Button>
          }
        />

        {/* Primary business metrics */}
        <section
          aria-label="Business summary"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            title="Total Sales"
            value="Rs 428,500"
            description="from previous month"
            icon={CircleDollarSign}
            accent="#78A394"
            trend="+12.4%"
          />

          <MetricCard
            title="Today's Sales"
            value="Rs 18,750"
            description="from yesterday"
            icon={CircleDollarSign}
            accent="#70588C"
            trend="+8.2%"
          />

          <MetricCard
            title="Inventory Turnover"
            value="10.09%"
            description="healthy stock movement"
            icon={Warehouse}
            accent="#78A394"
            trend="+4.8%"
          />

          <MetricCard
            title="Reorder Alerts"
            value="32"
            description="products need attention"
            icon={Package}
            accent="#E67E72"
            trend="+5"
            positive={false}
          />
        </section>

        {/* Secondary business metrics */}
        <section
          aria-label="Additional business metrics"
          className="grid gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#78A394]/10 text-[#78A394]">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Customers</p>
                <p className="mt-1 text-xl font-bold">846</p>
              </div>
              <Trend value="+5.2%" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#70588C]/10 text-[#70588C]">
                <ShoppingCart className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Orders</p>
                <p className="mt-1 text-xl font-bold">19</p>
              </div>
              <Trend value="-2.1%" positive={true} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#52B788]/10 text-[#52B788]">
                <CircleDollarSign className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                <p className="mt-1 text-xl font-bold">Rs 156,800</p>
              </div>
              <Trend value="+14.8%" />
            </CardContent>
          </Card>
        </section>

        {/* Main analytics row */}
        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Monthly Performance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sales and purchase activity over the last seven months.
                </p>
              </div>

              <Badge variant="secondary">2026</Badge>
            </CardHeader>

            <CardContent>
              <div className="h-[310px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPerformance}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barGap={5}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748B",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748B",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      cursor={{ fill: "#F3F6F8" }}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 8px 24px rgba(30, 41, 59, 0.08)",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={30}
                      iconType="circle"
                    />

                    <Bar
                      dataKey="sales"
                      name="Sales"
                      fill="#78A394"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />

                    <Bar
                      dataKey="purchases"
                      name="Purchases"
                      fill="#70588C"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Monthly Sales</p>
                  <p className="mt-1 text-sm font-bold">Rs 61,150</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Purchases</p>
                  <p className="mt-1 text-sm font-bold">Rs 34,850</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Growth</p>
                  <p className="mt-1 text-sm font-bold text-[#52B788]">+18.6%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Inventory Overview</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current stock status.
                </p>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/inventory">View all</Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border bg-[#F3F6F8]/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Product
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground">
                        Stock
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr
                        key={item.sku}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.sku}
                          </p>
                        </td>

                        <td className="px-3 py-3.5 text-right font-semibold">
                          {item.stock}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {item.status === "Healthy" ? (
                            <Badge variant="success">Healthy</Badge>
                          ) : (
                            <Badge variant="warning">Low</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Operational section */}
        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Recent Sales</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest completed transactions.
                </p>
              </div>

              <Button asChild variant="ghost" size="sm">
                <Link href="/sales">View all</Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border bg-[#F3F6F8]/70">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Invoice
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Customer
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Method
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentSales.map((sale) => (
                      <tr
                        key={sale.invoice}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium text-[#0F4C5C]">
                          {sale.invoice}
                        </td>

                        <td className="px-3 py-4 text-foreground">
                          {sale.customer}
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-muted-foreground">
                            {sale.method}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          {sale.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>Low Stock Products</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Products below minimum level.
                  </p>
                </div>

                <Badge variant="warning">3 Alerts</Badge>
              </CardHeader>

              <CardContent className="space-y-1">
                {lowStockItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg px-3 py-3 transition hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Minimum: {item.minimum}
                      </p>
                    </div>

                    <span className="ml-3 shrink-0 text-sm font-bold text-[#E67E72]">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#70588C]/20">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold">Pending Orders</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Purchases waiting to be received.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-[#70588C]">19</p>
                  <Link
                    href="/purchases"
                    className="text-xs font-semibold text-[#70588C] hover:underline"
                  >
                    Review orders
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}