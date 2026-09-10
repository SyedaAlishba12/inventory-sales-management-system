"use client";

import { CircleDollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { MainLayout, PageHeader } from "@/components/layout";
import {
  CartItem,
  ConfirmationDialog,
  CustomerCard,
  DatePicker,
  FilterBar,
  NotificationItem,
  PaymentSelector,
  ProductCard,
  ProductTable,
  SearchBar,
  StatCard,
  TotalSummary,
} from "@/components/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { CartLine, CustomerSummary, NotificationSummary, PaymentMethod, ProductSummary } from "@/types";

const products: ProductSummary[] = [
  { id: 1, name: "Wireless Mouse", sku: "MOUSE-001", categoryName: "Electronics", sellingPrice: 2499, stockQuantity: 18, minimumStock: 5 },
  { id: 2, name: "Mechanical Keyboard", sku: "KEY-014", categoryName: "Electronics", sellingPrice: 7499, stockQuantity: 3, minimumStock: 5 },
  { id: 3, name: "USB-C Cable", sku: "CAB-108", categoryName: "Accessories", sellingPrice: 899, stockQuantity: 0, minimumStock: 8 },
];

const customer: CustomerSummary = {
  id: 1042,
  name: "Ayesha Khan",
  phone: "+92 300 1234567",
  email: "ayesha@example.com",
  address: "Latifabad, Hyderabad, Sindh",
  totalSpending: 48650,
  purchaseCount: 12,
};

const notification: NotificationSummary = {
  id: 1,
  title: "Low stock detected",
  message: "Mechanical Keyboard has fallen below its minimum stock level.",
  type: "warning",
  isRead: false,
  createdAt: new Date(),
};

export default function BusinessUiKitPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const matchesQuery = `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || product.categoryName === category;
      return matchesQuery && matchesCategory;
    }),
    [category, query],
  );

  const cartItem: CartLine = {
    productId: products[0].id,
    name: products[0].name,
    sku: products[0].sku,
    unitPrice: products[0].sellingPrice,
    quantity,
    availableStock: products[0].stockQuantity,
  };
  const subtotal = cartItem.unitPrice * cartItem.quantity;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          title="Business Component Kit"
          description="Shared inventory, customer, notification, table, filter, and POS building blocks."
          breadcrumbs={[{ label: "UI Kit", href: "/ui-kit" }, { label: "Business components" }]}
          actions={<Button onClick={() => setConfirmationOpen(true)}>Test confirmation</Button>}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total sales" value="Rs 428,500" icon={CircleDollarSign} trend={12.4} />
          <StatCard title="Products" value="1,248" icon={Package} description="32 low-stock products" />
          <StatCard title="Customers" value="846" icon={Users} trend={5.2} />
          <StatCard title="Pending orders" value="19" icon={ShoppingCart} trend={-2.1} />
        </section>

        <section className="space-y-4">
          <FilterBar
            hasActiveFilters={Boolean(query || date || category !== "all")}
            onReset={() => { setQuery(""); setCategory("all"); setDate(""); }}
          >
            <SearchBar className="min-w-64 flex-1" value={query} onChange={setQuery} placeholder="Search name or SKU..." />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker value={date} onChange={setDate} className="w-full sm:w-44" />
          </FilterBar>
          <ProductTable products={filteredProducts} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {products.slice(0, 2).map((product) => <ProductCard key={product.id} product={product} onSelect={() => undefined} />)}
          </div>
          <div className="space-y-4">
            <CustomerCard customer={customer} />
            <NotificationItem notification={notification} />
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle>POS shared workflow</CardTitle></CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <CartItem item={cartItem} onQuantityChange={setQuantity} onRemove={() => setQuantity(1)} />
            <div className="space-y-4">
              <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
              <TotalSummary subtotal={subtotal} discount={250} tax={subtotal * 0.05} />
            </div>
          </CardContent>
        </Card>

        <ConfirmationDialog
          open={confirmationOpen}
          onOpenChange={setConfirmationOpen}
          title="Confirm shared action"
          description="This dialog can protect delete, restore, checkout, and stock-adjustment actions."
          confirmLabel="Confirm action"
          onConfirm={() => setConfirmationOpen(false)}
        />
      </div>
    </MainLayout>
  );
}
