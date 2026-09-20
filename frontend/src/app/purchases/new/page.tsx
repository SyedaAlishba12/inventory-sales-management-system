"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/utils/api-client";
import type { SupplierResponse } from "@/types/supplier";
import type { ProductSummary } from "@/types/product";
import type {
  PurchaseCreate,
  PurchaseItemCreate,
} from "@/types/purchase";
import { toastUtils } from "@/utils/toast";
import { formatCurrency } from "@/utils/currency";

function NewPurchaseContent() {
  const router = useRouter();

  const [suppliers, setSuppliers] =
    useState<SupplierResponse[]>([]);
  const [products, setProducts] =
    useState<ProductSummary[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItemCreate[]>([
    { product_id: "", quantity: 1, cost_price: 0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [suppliersData, productsData] =
          await Promise.all([
            apiClient.get<SupplierResponse[]>(
              "/api/suppliers",
            ),
            apiClient.get<ProductSummary[]>("/api/products"),
          ]);

        setSuppliers(suppliersData);
        setProducts(productsData);
      } catch (err) {
        toastUtils.error(
          err,
          "Error loading required data",
        );
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: "", quantity: 1, cost_price: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItemCreate,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) =>
        total + item.quantity * item.cost_price,
      0,
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toastUtils.error(
        new Error("Please select a supplier"),
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !item.product_id ||
          item.quantity <= 0 ||
          item.cost_price < 0,
      )
    ) {
      toastUtils.error(
        new Error(
          "Please fill all item fields correctly",
        ),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: PurchaseCreate = {
        supplier_id: supplierId,
        notes: notes || undefined,
        items,
      };

      const response = await apiClient.post<{ id: string }>(
        "/api/purchases",
        payload,
      );

      toastUtils.success("Purchase order created");
      router.push(`/purchases/${response.id}`);
    } catch (err) {
      toastUtils.error(
        err,
        "Error creating purchase order",
      );
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center p-10">
          <Spinner className="size-8" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/purchases">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">
              New Purchase Order
            </h1>

            <p className="text-sm text-muted-foreground">
              Create a new PO to restock inventory.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="space-y-4 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">
              General Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier{" "}
                  <span className="text-destructive">
                    *
                  </span>
                </Label>

                <select
                  id="supplier"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={supplierId}
                  onChange={(e) =>
                    setSupplierId(e.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Select a supplier
                  </option>

                  {suppliers.map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>

                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Optional notes for this order"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Line Items
              </h2>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="mr-2 size-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-4 rounded-lg bg-[#EAF0F2]/30 p-4"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Product</Label>

                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={item.product_id}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "product_id",
                          e.target.value,
                        )
                      }
                      required
                    >
                      <option value="" disabled>
                        Select a product
                      </option>

                      {products.map((p) => (
                        <option
                          key={p.id as string}
                          value={p.id as string}
                        >
                          {p.name} (SKU: {p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>Qty</Label>

                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      required
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Unit Cost</Label>

                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.cost_price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "cost_price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      required
                    />
                  </div>

                  <div className="w-24 space-y-2 pb-2 text-right">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Subtotal
                    </div>

                    <div className="font-semibold">
                      {formatCurrency(
                        item.quantity *
                          item.cost_price,
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive/90"
                    onClick={() =>
                      handleRemoveItem(index)
                    }
                    disabled={items.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg">
              <span className="font-medium text-muted-foreground">
                Order Total
              </span>

              <span className="text-xl font-bold text-[#0F4C5C]">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isSubmitting}
            >
              <Link href="/purchases">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner className="mr-2 size-4" />
              ) : null}
              Create Purchase Order
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default function NewPurchasePage() {
  return (
    <AuthGuard requireAdmin>
      <NewPurchaseContent />
    </AuthGuard>
  );
}