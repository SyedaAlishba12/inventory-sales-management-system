"use client";

import { useEffect, useState } from "react";

import {
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

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import type {
  CategoryRevenuePoint,
  DashboardResponse,
  InventoryOverviewItem,
  LowStockItem,
  RecentSale,
  TopProductPoint,
} from "@/types";
import { apiClient } from "@/utils/api-client";

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  featured = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof CircleDollarSign;
  accent: string;
  featured?: boolean;
}) {
  return (
    <Card
      className={`group relative overflow-hidden border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "bg-[#0F4C5C] text-white" : "bg-white"
      }`}
    >
      <div
        className="absolute -right-8 -top-8 size-28 rounded-full opacity-10"
        style={{ backgroundColor: accent }}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                featured ? "text-white/65" : "text-muted-foreground"
              }`}
            >
              {title}
            </p>

            <p
              className={`mt-3 text-[27px] font-bold tracking-tight ${
                featured ? "text-white" : "text-foreground"
              }`}
            >
              {value}
            </p>

            <p
              className={`mt-2 text-xs ${
                featured ? "text-white/60" : "text-muted-foreground"
              }`}
            >
              {description}
            </p>
          </div>

          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: featured
                ? "rgba(255,255,255,0.12)"
                : `${accent}18`,
              color: featured ? "#FFFFFF" : accent,
            }}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#70588C]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function InventoryStatus({
  item,
}: {
  item: InventoryOverviewItem;
}) {
  return item.status === "Healthy" ? (
    <Badge variant="success">Healthy</Badge>
  ) : (
    <Badge variant="warning">Low</Badge>
  );
}

function TopProductsList({
  products,
}: {
  products: TopProductPoint[];
}) {
  if (!products.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
        No completed sales yet.
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...products.map((product) => Number(product.revenue)),
    1,
  );

  return (
    <div className="space-y-3">
      {products.map((product: TopProductPoint, index: number) => {
        const revenue = Number(product.revenue);
        const percentage = (revenue / maxRevenue) * 100;

        return (
          <div
            key={product.product_id}
            className="rounded-2xl border border-border/60 bg-[#F8FAFB] p-3.5 transition-all duration-200 hover:border-[#78A394]/40 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  index === 0
                    ? "bg-[#0F4C5C] text-white"
                    : "bg-[#E8EEF0] text-[#0F4C5C]"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {product.product_name}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.quantity_sold}{" "}
                  {product.quantity_sold === 1 ? "unit" : "units"} sold
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-[#0F4C5C]">
                {formatCurrency(revenue)}
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#78A394] transition-all"
                style={{ width: `${Math.max(percentage, 5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryRevenueList({
  categories,
}: {
  categories: CategoryRevenuePoint[];
}) {
  if (!categories.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
        No category revenue yet.
      </div>
    );
  }

  const totalRevenue = categories.reduce(
    (total: number, category: CategoryRevenuePoint) =>
      total + Number(category.revenue),
    0,
  );

  return (
    <div className="space-y-5">
      {categories.slice(0, 5).map((category: CategoryRevenuePoint) => {
        const revenue = Number(category.revenue);

        const percentage =
          totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

        return (
          <div key={category.category_id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full bg-[#78A394]" />

                <p className="truncate text-sm font-semibold">
                  {category.category_name}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold text-[#0F4C5C]">
                {formatCurrency(revenue)}
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#E8EEF0]">
              <div
                className="h-full rounded-full bg-[#78A394]"
                style={{
                  width: `${Math.max(percentage, 3)}%`,
                }}
              />
            </div>

            <div className="mt-1.5 flex justify-end">
              <p className="text-[11px] font-medium text-muted-foreground">
                {percentage.toFixed(1)}% of revenue
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentSalesTable({
  sales,
  loading,
  emptyMessage = "No completed sales yet.",
}: {
  sales: RecentSale[];
  loading: boolean;
  emptyMessage?: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
      <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <SectionHeading
            eyebrow="Transactions"
            title="Recent Sales"
            description="Latest completed transactions from the sales system."
          />

          <Button asChild variant="ghost" size="sm">
            <Link href="/sales">View all</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-white">
                <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Invoice
                </th>

                <th className="px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Customer
                </th>

                <th className="px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Method
                </th>

                <th className="px-3 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Date
                </th>

                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length ? (
                sales.map((sale: RecentSale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-[#F8FAFB]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="inline-flex rounded-lg bg-[#0F4C5C]/5 px-2.5 py-1 text-xs font-bold text-[#0F4C5C] hover:bg-[#0F4C5C]/10"
                      >
                        {sale.invoice_number}
                      </Link>
                    </td>

                    <td className="px-3 py-4 text-sm text-foreground">
                      {sale.customer_name}
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-full bg-[#F3F6F8] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {sale.payment_method}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-xs text-muted-foreground">
                      {formatDate(sale.sale_date)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-[#0F4C5C]">
                      {formatCurrency(Number(sale.total))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockCard({
  items,
  loading,
}: {
  items: LowStockItem[];
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden border-[#E67E72]/20 bg-white shadow-sm">
      <CardHeader className="border-b border-[#E67E72]/10 bg-[#E67E72]/[0.045] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <SectionHeading
            eyebrow="Attention"
            title="Low Stock"
            description="Products at or below their minimum level."
          />

          <Badge variant="warning">
            {loading ? "—" : items.length}{" "}
            {items.length === 1 ? "Alert" : "Alerts"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {loading ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Loading stock alerts...
          </div>
        ) : items.length ? (
          items.map((item: LowStockItem) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-[#E67E72]/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {item.product_name}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Minimum: {item.min_stock_level}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#E67E72]/10 px-2.5 py-1 text-xs font-bold text-[#E67E72]">
                {item.current_stock} left
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-[#52B788]/5 px-4 py-7 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#52B788]/10 text-[#52B788]">
              <Package className="size-5" />
            </div>

            <p className="mt-3 text-sm font-semibold text-[#52B788]">
              Stock levels look good
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              No products currently need reordering.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryOverview({
  items,
  loading,
}: {
  items: InventoryOverviewItem[];
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
      <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <SectionHeading
            eyebrow="Stock"
            title="Inventory Overview"
            description="Current stock position across your products."
          />

          <Button asChild variant="outline" size="sm">
            <Link href="/inventory">View all</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
            Loading inventory...
          </div>
        ) : items.length ? (
          <div className="space-y-2">
            {items.map((item: InventoryOverviewItem) => (
              <div
                key={item.product_id}
                className="rounded-2xl border border-border/50 bg-[#F8FAFB] p-3.5 transition-all hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#78A394]/10 text-[#78A394]">
                    <Package className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.product_name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.sku}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {item.current_stock}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Min {item.min_stock_level}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "Healthy"
                          ? "bg-[#52B788]"
                          : "bg-[#E67E72]"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(
                            (item.current_stock /
                              Math.max(item.min_stock_level * 3, 1)) *
                              100,
                            8,
                          ),
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="ml-3">
                    <InventoryStatus item={item} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
            No inventory records available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboard({
  dashboard,
  loading,
}: {
  dashboard: DashboardResponse | null;
  loading: boolean;
}) {
  const stats = dashboard?.stats;

  const monthlySales = dashboard?.monthly_sales ?? [];
  const inventoryItems = dashboard?.inventory_overview ?? [];
  const recentSales = dashboard?.recent_sales ?? [];
  const lowStockItems = dashboard?.low_stock_items ?? [];
  const topProducts = dashboard?.top_products ?? [];
  const categoryRevenue = dashboard?.category_revenue ?? [];

  const totalCategoryRevenue = categoryRevenue.reduce(
    (total: number, category: CategoryRevenuePoint) =>
      total + Number(category.revenue),
    0,
  );

  return (
    <>
      <div className="rounded-[26px] border border-border/70 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <PageHeader
            title="Admin Dashboard"
            description="A live view of your sales, stock, customers, and business operations."
            actions={undefined}
          />

          <Button
            asChild
            className="w-full shrink-0 shadow-md shadow-[#0F4C5C]/15 sm:w-auto"
          >
            <Link href="/pos">
              <ShoppingCart className="size-4" />
              New Sale
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#52B788]/10 px-3 py-1.5 text-xs font-semibold text-[#52B788]">
            <span className="size-2 rounded-full bg-[#52B788]" />
            Admin view
          </span>

          <span className="rounded-full bg-[#F3F6F8] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Live business data
          </span>
        </div>
      </div>

      <section
        aria-label="Business summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Total Sales"
          value={loading ? "—" : formatCurrency(Number(stats?.total_sales ?? 0))}
          description="All completed sales"
          icon={CircleDollarSign}
          accent="#78A394"
          featured
        />

        <MetricCard
          title="Today's Sales"
          value={
            loading ? "—" : formatCurrency(Number(stats?.todays_sales ?? 0))
          }
          description="Completed sales today"
          icon={CircleDollarSign}
          accent="#70588C"
        />

        <MetricCard
          title="Total Products"
          value={loading ? "—" : String(stats?.total_products ?? 0)}
          description="Products currently in catalog"
          icon={Warehouse}
          accent="#78A394"
        />

        <MetricCard
          title="Reorder Alerts"
          value={loading ? "—" : String(stats?.low_stock_products ?? 0)}
          description={
            stats?.low_stock_products === 1
              ? "Product needs attention"
              : "Products need attention"
          }
          icon={Package}
          accent="#E67E72"
        />
      </section>

      <section
        aria-label="Additional business metrics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card className="border-border/70 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#78A394]/10 text-[#78A394]">
              <Users className="size-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Total Customers
              </p>

              <p className="mt-1 text-xl font-bold">
                {loading ? "—" : stats?.total_customers ?? 0}
              </p>
            </div>

            <span className="ml-auto rounded-full bg-[#F3F6F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Current
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#70588C]/10 text-[#70588C]">
              <ShoppingCart className="size-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Pending Orders
              </p>

              <p className="mt-1 text-xl font-bold">
                {loading ? "—" : stats?.pending_orders ?? 0}
              </p>
            </div>

            <span className="ml-auto rounded-full bg-[#F3F6F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              To receive
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#52B788]/10 text-[#52B788]">
              <CircleDollarSign className="size-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Monthly Revenue
              </p>

              <p className="mt-1 text-xl font-bold">
                {loading
                  ? "—"
                  : formatCurrency(Number(stats?.monthly_revenue ?? 0))}
              </p>
            </div>

            <span className="ml-auto rounded-full bg-[#F3F6F8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              This month
            </span>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
          <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#70588C]">
                  Performance
                </p>

                <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <h2 className="text-xl font-bold tracking-tight">
                    Monthly Sales
                  </h2>

                  <span className="text-sm font-medium text-muted-foreground">
                    {loading
                      ? "Loading..."
                      : formatCurrency(
                          Number(stats?.monthly_revenue ?? 0),
                        )}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Completed sales recorded over the available months.
                </p>
              </div>

              <Badge variant="secondary">Live data</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <div className="h-[315px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading sales data...
                </div>
              ) : monthlySales.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySales}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
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
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Sales",
                      ]}
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid #E2E8F0",
                        boxShadow:
                          "0 12px 30px rgba(30, 41, 59, 0.10)",
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
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                  No completed sales available yet.
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F8FAFB] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Monthly Revenue
                </p>

                <p className="mt-1.5 text-base font-bold text-[#0F4C5C]">
                  {loading
                    ? "—"
                    : formatCurrency(
                        Number(stats?.monthly_revenue ?? 0),
                      )}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFB] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Sales Records
                </p>

                <p className="mt-1.5 text-base font-bold">
                  {monthlySales.length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#70588C]/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Data Source
                </p>

                <p className="mt-1.5 text-base font-bold text-[#70588C]">
                  Dashboard API
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <InventoryOverview
          items={inventoryItems}
          loading={loading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <RecentSalesTable
          sales={recentSales}
          loading={loading}
        />

        <div className="space-y-6">
          <LowStockCard
            items={lowStockItems}
            loading={loading}
          />

          <Card className="overflow-hidden border-[#70588C]/20 bg-[#70588C]/[0.035] shadow-sm">
            <CardContent className="relative p-5">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#70588C]" />

              <div className="flex items-center justify-between gap-5 pl-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#70588C]">
                    Purchasing
                  </p>

                  <p className="mt-1.5 text-sm font-bold">
                    Pending Orders
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Purchases waiting to be received.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-[#70588C]">
                    {loading ? "—" : stats?.pending_orders ?? 0}
                  </p>

                  <Link
                    href="/purchases"
                    className="mt-1 inline-block text-xs font-semibold text-[#70588C] hover:underline"
                  >
                    Review orders →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
          <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
            <SectionHeading
              eyebrow="Products"
              title="Top Selling Products"
              description="Products generating the most completed-sale volume."
            />
          </CardHeader>

          <CardContent className="p-5">
            <TopProductsList products={topProducts} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
          <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <SectionHeading
                eyebrow="Categories"
                title="Revenue by Category"
                description="How completed sales are distributed across categories."
              />

              <div className="rounded-2xl bg-[#0F4C5C]/5 px-3 py-2 text-right">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  Total
                </p>

                <p className="mt-1 text-sm font-bold text-[#0F4C5C]">
                  {loading
                    ? "—"
                    : formatCurrency(totalCategoryRevenue)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <CategoryRevenueList categories={categoryRevenue} />
          </CardContent>
        </Card>
      </section>

      {!loading && dashboard ? (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0F4C5C]/10 bg-[#0F4C5C]/[0.035] px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#52B788]/10 text-[#52B788]">
              <ArrowUpRight className="size-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0F4C5C]">
                Dashboard synced with your business data
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Sales, inventory, customer, purchase, and category figures
                are coming from the Dashboard API.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#52B788]">
            <span className="size-2 rounded-full bg-[#52B788]" />
            Live data
          </div>
        </div>
      ) : null}
    </>
  );
}

function StaffDashboard({
  dashboard,
  loading,
}: {
  dashboard: DashboardResponse | null;
  loading: boolean;
}) {
  const stats = dashboard?.stats;
  const recentSales = dashboard?.recent_sales ?? [];
  const lowStockItems = dashboard?.low_stock_items ?? [];
  const inventoryItems = dashboard?.inventory_overview ?? [];

  return (
    <>
      <div className="rounded-[26px] border border-border/70 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <PageHeader
            title="Staff Dashboard"
            description="A focused view of today's sales, stock, and day-to-day operations."
            actions={undefined}
          />

          <Button
            asChild
            className="w-full shrink-0 shadow-md shadow-[#0F4C5C]/15 sm:w-auto"
          >
            <Link href="/pos">
              <ShoppingCart className="size-4" />
              New Sale
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#52B788]/10 px-3 py-1.5 text-xs font-semibold text-[#52B788]">
            <span className="size-2 rounded-full bg-[#52B788]" />
            Staff view
          </span>

          <span className="rounded-full bg-[#F3F6F8] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Daily operations
          </span>
        </div>
      </div>

      <section
        aria-label="Staff summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Today's Sales"
          value={
            loading
              ? "—"
              : formatCurrency(Number(stats?.todays_sales ?? 0))
          }
          description="Completed sales today"
          icon={CircleDollarSign}
          accent="#78A394"
          featured
        />

        <MetricCard
          title="Stock Alerts"
          value={loading ? "—" : String(stats?.low_stock_products ?? 0)}
          description="Products needing attention"
          icon={Package}
          accent="#E67E72"
        />

        <MetricCard
          title="Products"
          value={loading ? "—" : String(stats?.total_products ?? 0)}
          description="Products in the catalog"
          icon={Warehouse}
          accent="#70588C"
        />

        <MetricCard
          title="Customers"
          value={loading ? "—" : String(stats?.total_customers ?? 0)}
          description="Customers available for sales"
          icon={Users}
          accent="#52B788"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
          <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <SectionHeading
                eyebrow="Quick Action"
                title="Start a New Sale"
                description="Open the POS to create a new customer transaction."
              />

              <ShoppingCart className="size-5 text-[#0F4C5C]" />
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="rounded-2xl bg-[#0F4C5C]/[0.045] p-5">
              <p className="text-sm font-semibold text-[#0F4C5C]">
                Ready for the next customer?
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Check product availability and complete the sale through the
                POS.
              </p>

              <Button
                asChild
                className="mt-4 shadow-sm"
              >
                <Link href="/pos">
                  <ShoppingCart className="size-4" />
                  Open POS
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <LowStockCard
          items={lowStockItems}
          loading={loading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <RecentSalesTable
          sales={recentSales}
          loading={loading}
          emptyMessage="No recent sales available."
        />

        <InventoryOverview
          items={inventoryItems}
          loading={loading}
        />
      </section>

      <Card className="overflow-hidden border-[#0F4C5C]/10 bg-white shadow-sm">
        <CardHeader className="border-b border-border/60 bg-[#F8FAFB] px-5 py-5">
          <SectionHeading
            eyebrow="Daily Work"
            title="Staff Quick Links"
            description="Common operational areas available from the dashboard."
          />
        </CardHeader>

        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          <Button
            asChild
            variant="outline"
            className="justify-start"
          >
            <Link href="/pos">
              <ShoppingCart className="size-4" />
              Open POS
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="justify-start"
          >
            <Link href="/inventory">
              <Package className="size-4" />
              Check Inventory
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="justify-start"
          >
            <Link href="/sales">
              <CircleDollarSign className="size-4" />
              View Sales
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<DashboardResponse>(
          "/api/dashboard",
        );

        if (mounted) {
          setDashboard(response);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const role = user?.role?.toLowerCase();

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-7 pb-8">
        <Card className="border-[#E67E72]/30 bg-[#E67E72]/5">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Dashboard data could not be loaded.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "staff") {
    return (
      <div className="mx-auto max-w-7xl space-y-7 pb-8">
        <StaffDashboard
          dashboard={dashboard}
          loading={loading}
        />
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="mx-auto max-w-7xl space-y-7 pb-8">
        <AdminDashboard
          dashboard={dashboard}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-8">
      <Card className="border-border/70 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-lg font-bold text-foreground">
            Dashboard access is not available for this account.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Please contact an administrator if you need access to business
            dashboard features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </AuthGuard>
  );
}