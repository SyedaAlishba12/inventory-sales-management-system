"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { CartItem, ProductSearch } from "@/components/shared/pos";
import { CustomerPicker } from "@/components/pos/customer-picker";
import { PaymentCheckout } from "@/components/pos/payment-checkout";
import { PosProductGrid } from "@/components/pos/pos-product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/utils/api-client";
import { mapPosProductList } from "@/utils/pos-product-mapper";
import { mapSale } from "@/utils/sale-mapper";
import { toastUtils } from "@/utils/toast";
import type { CartLine, Identifier, PosProduct } from "@/types";

const DEFAULT_TAX_RATE = 0;

const CART_STORAGE_KEY = "pos-cart";
const CUSTOMER_STORAGE_KEY = "pos-selected-customer";
const DISCOUNT_STORAGE_KEY = "pos-discount";

function PosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkoutMode = searchParams.get("checkout") === "true";

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

  const [browseProducts, setBrowseProducts] = useState<PosProduct[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);

  /*
   * Restore the current POS session when the page is opened/refreshed.
   */
  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }

      const storedCustomer = sessionStorage.getItem(CUSTOMER_STORAGE_KEY);

      if (storedCustomer) {
        const parsedCustomer = JSON.parse(storedCustomer);

        if (parsedCustomer) {
          setSelectedCustomer(parsedCustomer);
        }
      }

      const storedDiscount = sessionStorage.getItem(DISCOUNT_STORAGE_KEY);

      if (storedDiscount) {
        const parsedDiscount = Number(storedDiscount);

        if (!Number.isNaN(parsedDiscount)) {
          setDiscount(parsedDiscount);
        }
      }
    } catch {
      // Ignore invalid session storage data.
    }
  }, []);

  /*
   * Load products for the main POS product browser.
   */
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

  /*
   * Search products when the user types in the POS search bar.
   */
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
        query: {
          search: query,
          limit: 10,
        },
        signal: controller.signal,
      })
      .then((raw) => setSearchResults(mapPosProductList(raw)))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  /*
   * Add product to cart and immediately move to checkout view.
   */
  function addToCart(product: PosProduct) {
    setCart((current) => {
      const existing = current.find(
        (line) => line.productId === product.id,
      );

      const nextCart = existing
        ? current.map((line) =>
            line.productId === product.id
              ? {
                  ...line,
                  quantity: Math.min(
                    line.quantity + 1,
                    product.stockQuantity,
                  ),
                }
              : line,
          )
        : [
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

      try {
        sessionStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // Ignore storage errors.
      }

      return nextCart;
    });

    setSearchQuery("");
    setSearchResults([]);

    router.push("/pos?checkout=true");
  }

  function updateQuantity(
    productId: string | number,
    quantity: number,
  ) {
    setCart((current) => {
      const nextCart = current.map((line) =>
        line.productId === productId
          ? {
              ...line,
              quantity,
            }
          : line,
      );

      try {
        sessionStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // Ignore storage errors.
      }

      return nextCart;
    });
  }

  function removeFromCart(productId: string | number) {
    setCart((current) => {
      const nextCart = current.filter(
        (line) => line.productId !== productId,
      );

      try {
        sessionStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(nextCart),
        );
      } catch {
        // Ignore storage errors.
      }

      return nextCart;
    });
  }

  function handleCustomerChange(
    customer: {
      id: Identifier;
      name: string;
      phone?: string;
    } | null,
  ) {
    setSelectedCustomer(customer);

    try {
      if (customer) {
        sessionStorage.setItem(
          CUSTOMER_STORAGE_KEY,
          JSON.stringify(customer),
        );
      } else {
        sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors.
    }
  }

  function handleDiscountChange(value: number) {
    setDiscount(value);

    try {
      sessionStorage.setItem(
        DISCOUNT_STORAGE_KEY,
        String(value),
      );
    } catch {
      // Ignore storage errors.
    }
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      ),
    [cart],
  );

  const tax = useMemo(
    () =>
      Math.max(subtotal - discount, 0) *
      (DEFAULT_TAX_RATE / 100),
    [subtotal, discount],
  );

  async function handleConfirmPayment({
    paymentMethod,
  }: {
    paymentMethod: "CASH" | "CARD" | "ONLINE";
  }) {
    try {
      const raw = await apiClient.post<Parameters<typeof mapSale>[0]>(
        "/api/pos/checkout",
        {
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
        },
      );

      const sale = mapSale(raw);

      toastUtils.success(
        "Sale completed",
        `Invoice ${sale.invoiceNumber} generated.`,
      );

      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);

      try {
        sessionStorage.removeItem(CART_STORAGE_KEY);
        sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
        sessionStorage.removeItem(DISCOUNT_STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }

      router.push(`/invoices/${sale.id}`);
    } catch (error) {
      toastUtils.error(
        error,
        "Could not complete the sale",
      );
    }
  }

  function goBackToProducts() {
    router.push("/pos");
  }

  /*
   * CHECKOUT VIEW
   *
   * This uses the same /pos page but with:
   * /pos?checkout=true
   *
   * No separate checkout page file is required.
   */
  if (checkoutMode) {
    return (
      <MainLayout navigation={defaultNavigation}>
        <div className="space-y-6">
          <PageHeader
            title="Checkout"
            description="Review your cart and complete the payment."
          />

          <Button
            type="button"
            variant="outline"
            onClick={goBackToProducts}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Continue Shopping
          </Button>

          {cart.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Go back to the products and add an item before checking out."
            />
          ) : (
            <div className="space-y-6">
              <CustomerPicker
                selectedCustomer={selectedCustomer}
                onSelect={handleCustomerChange}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Cart
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Review the products before payment.
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {cart.length}{" "}
                    {cart.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-3">
                  {cart.map((line) => (
                    <CartItem
                      key={line.productId}
                      item={line}
                      onQuantityChange={(quantity) =>
                        updateQuantity(
                          line.productId,
                          quantity,
                        )
                      }
                      onRemove={() =>
                        removeFromCart(line.productId)
                      }
                    />
                  ))}
                </div>
              </div>

              <PaymentCheckout
                items={cart.map((line) => ({
                  name: line.name,
                  quantity: line.quantity,
                  price: line.unitPrice,
                }))}
                subtotal={subtotal}
                discount={discount}
                onDiscountChange={handleDiscountChange}
                tax={tax}
                onConfirm={handleConfirmPayment}
              />
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  /*
   * MAIN POS PRODUCT VIEW
   *
   * Only product search and product browsing are shown here.
   * The cart/checkout is on /pos?checkout=true.
   */
  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <PageHeader
          title="Point of Sale"
          description="Search products and select a product to continue to checkout."
        />

        {cart.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/pos?checkout=true")}
            className="gap-2"
          >
            <ShoppingCart className="size-4" />
            View Cart ({cart.length})
          </Button>
        )}

        <div className="space-y-5">
          <ProductSearch
            value={searchQuery}
            onChange={setSearchQuery}
            results={searchResults}
            onSelect={addToCart}
            loading={searching}
          />

          {!searchQuery.trim() && (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Browse Products
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a product to add it to the cart and continue
                  to checkout.
                </p>
              </div>

              <PosProductGrid
                products={browseProducts}
                loading={browseLoading}
                onSelect={addToCart}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function PosPage() {
  return (
    <Suspense
      fallback={
        <MainLayout navigation={defaultNavigation}>
          <div className="space-y-6">
            <PageHeader
              title="Point of Sale"
              description="Loading point of sale..."
            />
          </div>
        </MainLayout>
      }
    >
      <PosPageContent />
    </Suspense>
  );
}