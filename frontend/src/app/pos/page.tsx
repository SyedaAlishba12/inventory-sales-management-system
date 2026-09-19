"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { CartItem, ProductSearch } from "@/components/shared/pos";
import { CustomerPicker } from "@/components/pos/customer-picker";
import { PaymentCheckout } from "@/components/pos/payment-checkout";
import { PosProductGrid } from "@/components/pos/pos-product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/utils/api-client";
import { mapPosProductList } from "@/utils/pos-product-mapper";
import { mapSale } from "@/utils/sale-mapper";
import { toastUtils } from "@/utils/toast";
import type { CartLine, Identifier, PosProduct } from "@/types";

// TODO: swap for real tax rate config once Taha/Zainab's settings module lands.
const DEFAULT_TAX_RATE = 0;

export default function PosPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: Identifier;
    name: string;
    phone?: string;
  } | null>(null);

  // Browse mode: default product grid shown when the search box is empty.
  // Doc requirement B: "Browse products" is separate from "Search products".
  const [browseProducts, setBrowseProducts] = useState<PosProduct[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setBrowseLoading(true);

    apiClient
      .get<Parameters<typeof mapPosProductList>[0]>("/api/pos/products", {
        query: { limit: 12 },
        signal: controller.signal,
      })
      .then((raw) => setBrowseProducts(mapPosProductList(raw)))
      .catch(() => setBrowseProducts([]))
      .finally(() => setBrowseLoading(false));

    return () => controller.abort();
  }, []);

  // Live product search — hits Zainab's product+inventory query via
  // /api/pos/products (now wired to real data).
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    apiClient
      .get<Parameters<typeof mapPosProductList>[0]>("/api/pos/products", {
        query: { search: query, limit: 10 },
        signal: controller.signal,
      })
      .then((raw) => setSearchResults(mapPosProductList(raw)))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  function addToCart(product: PosProduct) {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, product.stockQuantity) }
            : line,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: 1,
          availableStock: product.stockQuantity,
        },
      ];
    });
    setSearchQuery("");
    setSearchResults([]);
  }

  function updateQuantity(productId: string | number, quantity: number) {
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    );
  }

  function removeFromCart(productId: string | number) {
    setCart((current) => current.filter((line) => line.productId !== productId));
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );
  const tax = useMemo(
    () => Math.max(subtotal - discount, 0) * (DEFAULT_TAX_RATE / 100),
    [subtotal, discount],
  );

  async function handleConfirmPayment({
    paymentMethod,
  }: {
    paymentMethod: "CASH" | "CARD" | "ONLINE";
  }) {
    try {
      const raw = await apiClient.post<Parameters<typeof mapSale>[0]>("/api/pos/checkout", {
        customer_id: selectedCustomer?.id ?? null,
        items: cart.map((line) => ({
          product_id: line.productId,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          item_discount: 0,
        })),
        discount,
        is_percent_discount: false,
        tax_rate: DEFAULT_TAX_RATE,
        payment_method: paymentMethod,
      });
      const sale = mapSale(raw);
      toastUtils.success("Sale completed", `Invoice ${sale.invoiceNumber} generated.`);
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
      router.push(`/invoices/${sale.id}`);
    } catch (error) {
      toastUtils.error(error, "Could not complete the sale");
    }
  }

  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <PageHeader
          title="Point of Sale"
          description="Search products, build the cart, and check out."
        />

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left: search + cart */}
          <div className="space-y-4">
            <CustomerPicker selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />

            <ProductSearch
              value={searchQuery}
              onChange={setSearchQuery}
              results={searchResults}
              onSelect={addToCart}
              loading={searching}
            />

            {!searchQuery.trim() && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Browse products</p>
                <PosProductGrid products={browseProducts} loading={browseLoading} onSelect={addToCart} />
              </div>
            )}

            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Cart is empty"
                description="Search or browse products and select one to add to the cart."
              />
            ) : (
              <div className="space-y-3">
                {cart.map((line) => (
                  <CartItem
                    key={line.productId}
                    item={line}
                    onQuantityChange={(quantity) => updateQuantity(line.productId, quantity)}
                    onRemove={() => removeFromCart(line.productId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: payment method + order summary + confirm */}
          <div>
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add products to the cart to continue to payment.
              </p>
            ) : (
              <PaymentCheckout
                items={cart.map((line) => ({
                  name: line.name,
                  quantity: line.quantity,
                  price: line.unitPrice,
                }))}
                subtotal={subtotal}
                discount={discount}
                onDiscountChange={setDiscount}
                tax={tax}
                onConfirm={handleConfirmPayment}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
