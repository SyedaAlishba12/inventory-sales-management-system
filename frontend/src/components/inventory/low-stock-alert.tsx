"use client";

import {
  AlertTriangle,
  Package,
} from "lucide-react";

interface LowStockItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  min_stock_level: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

export function LowStockAlert({
  items,
}: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white p-2">
            <Package className="size-5 text-green-600" />
          </div>

          <div>
            <h2 className="font-semibold text-green-800">
              Stock Levels Healthy
            </h2>

            <p className="mt-1 text-sm text-green-700">
              No products are currently below their minimum stock level.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-white p-2">
          <AlertTriangle className="size-5 text-orange-600" />
        </div>

        <div>
          <h2 className="font-semibold text-orange-800">
            Low Stock Alert
          </h2>

          <p className="mt-1 text-sm text-orange-700">
            {items.length === 1
              ? "1 product is below the minimum stock level."
              : `${items.length} products are below the minimum stock level.`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-2 rounded-lg border border-orange-200 bg-white px-4 py-3 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-medium text-[#0F4C5C]">
                {item.product_name}
              </p>

              <p className="text-xs text-[#7A8B91]">
                SKU: {item.sku}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#52646A]">
                Current:{" "}
                <strong className="text-orange-600">
                  {item.current_stock}
                </strong>
              </span>

              <span className="text-[#52646A]">
                Minimum:{" "}
                <strong>
                  {item.min_stock_level}
                </strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}