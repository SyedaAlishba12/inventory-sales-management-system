"use client";

import { FormEvent, useState } from "react";
import {
  Save,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AdjustmentProduct {
  id: string;
  name: string;
  sku: string;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  products: AdjustmentProduct[];
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

type MovementType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "DAMAGED"
  | "ADJUSTMENT";

export function StockAdjustmentModal({
  isOpen,
  products,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [productId, setProductId] =
    useState("");

  const [movementType, setMovementType] =
    useState<MovementType>("STOCK_IN");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const numericQuantity =
      Number(quantity);

    if (!productId) {
      alert("Please select a product.");
      return;
    }

    if (
      movementType === "ADJUSTMENT"
        ? numericQuantity < 0
        : numericQuantity <= 0
    ) {
      alert(
        movementType === "ADJUSTMENT"
          ? "Adjusted stock cannot be negative."
          : "Quantity must be greater than zero."
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/inventory/adjust",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            product_id: productId,
            quantity: numericQuantity,
            movement_type: movementType,
            reason: reason.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to adjust inventory."
        );
      }

      setProductId("");
      setMovementType("STOCK_IN");
      setQuantity("");
      setReason("");

      await onSuccess();

      onClose();
    } catch (error) {
      console.error(
        "Inventory adjustment error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to adjust inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#D7E0E3] bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#D7E0E3] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F4C5C]">
              Stock Adjustment
            </h2>

            <p className="mt-1 text-xs text-[#7A8B91]">
              Record a manual inventory movement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-[#7A8B91] hover:bg-[#F3F6F7]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* PRODUCT */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#52646A]">
              Product
            </label>

            <select
              value={productId}
              onChange={(event) =>
                setProductId(
                  event.target.value
                )
              }
              className="w-full rounded-md border border-[#D7E0E3] bg-white px-3 py-2 text-sm text-[#0F4C5C] focus:outline-none"
              required
            >
              <option value="">
                Select Product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          {/* MOVEMENT TYPE */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#52646A]">
              Movement Type
            </label>

            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(
                  event.target
                    .value as MovementType
                )
              }
              className="w-full rounded-md border border-[#D7E0E3] bg-white px-3 py-2 text-sm text-[#0F4C5C] focus:outline-none"
            >
              <option value="STOCK_IN">
                Stock In
              </option>

              <option value="STOCK_OUT">
                Stock Out
              </option>

              <option value="DAMAGED">
                Damaged
              </option>

              <option value="ADJUSTMENT">
                Adjustment
              </option>
            </select>
          </div>

          {/* QUANTITY */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#52646A]">
              {movementType === "ADJUSTMENT"
                ? "New Stock Level"
                : "Quantity"}
            </label>

            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              placeholder={
                movementType === "ADJUSTMENT"
                  ? "Enter new stock level"
                  : "Enter quantity"
              }
              required
            />

            {movementType ===
              "ADJUSTMENT" && (
              <p className="text-xs text-[#7A8B91]">
                Adjustment sets the stock to the exact value entered.
              </p>
            )}
          </div>

          {/* REASON */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#52646A]">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              maxLength={500}
              rows={3}
              placeholder="Enter reason for this movement..."
              className="w-full resize-none rounded-md border border-[#D7E0E3] px-3 py-2 text-sm text-[#0F4C5C] outline-none focus:border-[#0F4C5C]"
            />
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-[#D7E0E3] text-[#0F4C5C]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90"
            >
              <Save className="mr-2 size-4" />

              {saving
                ? "Saving..."
                : "Save Adjustment"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}