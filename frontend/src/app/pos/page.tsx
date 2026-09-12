"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { CartItem, ProductSearch } from "@/components/shared/pos";
import { PaymentCheckout } from "@/components/checkout/payment-checkout";
import { EmptyState } from "@/components/ui/empty-state";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/utils/api-client";
import { toastUtils } from "@/utils/toast";
import type { CartLine, PosProduct } from "@/types";

// TODO: swap for real tax rate config once Taha/Zainab's settings module lands.
const DEFAULT_TAX_RATE = 0;

export default function PosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);

  // Live product search — hits Zainab's products endpoint via our /api/pos/products
  // proxy (currently a stub, so results are empty until her PR merges).
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    apiClient
      .get<PosProduct[]>("/api/pos/products", {
        query: { search: query, limit: 10 },
        signal: controller.signal,
      })
      .then(setSearchResults)
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

  function addTestItem() {
    // TEMPORARY — for local UI testing only, until Zainab's product search
    // is wired up. Safe to delete this function and its button once
    // /api/pos/products returns real data.
    const testProduct: PosProduct = {
      id: `test-${Date.now()}`,
      name: "Wireless Mouse (test item)",
      sku: "TEST-001",
      price: 1500,
      stockQuantity: 10,
      imageUrl: null,
    };
    addToCart(testProduct);
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
      // TODO: real customer_id once a customer picker exists (Taha's module).
      await apiClient.post("/api/pos/checkout", {
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
      toastUtils.success("Sale completed", "Invoice generated successfully.");
      setCart([]);
      setDiscount(0);
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
            <ProductSearch
              value={searchQuery}
              onChange={setSearchQuery}
              results={searchResults}
              onSelect={addToCart}
              loading={searching}
            />

            {cart.length === 0 ? (
              <div className="space-y-3">
                <EmptyState
                  icon={ShoppingCart}
                  title="Cart is empty"
                  description="Search for a product above and select it to add to the cart."
                />
                <button
                  type="button"
                  onClick={addTestItem}
                  className="w-full rounded-lg border border-dashed border-input py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  + Add test item (dev only — remove once product search works)
                </button>
              </div>
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
