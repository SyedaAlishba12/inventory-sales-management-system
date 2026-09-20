"use client";

import {
  AlertTriangle,
  Package,
} from "lucide-react";

export interface InventoryProduct {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  opening_stock: number;
  current_stock: number;
  damaged_stock: number;
  min_stock_level: number;
}

interface InventoryTableProps {
  inventory: InventoryProduct[];
}

export function InventoryTable({
  inventory,
}: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-[#D7E0E3] bg-white py-12 text-center">
        <Package className="mx-auto mb-3 size-10 text-[#A8B5B9]" />

        <p className="font-medium text-[#0F4C5C]">
          No inventory records found
        </p>

        <p className="mt-1 text-sm text-[#7A8B91]">
          Inventory records will appear here once products have stock.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#D7E0E3] bg-white shadow-sm">
      <div className="border-b border-[#D7E0E3] px-5 py-4">
        <div>
          <h2 className="font-semibold text-[#0F4C5C]">
            Current Inventory
          </h2>

          <p className="mt-1 text-xs text-[#7A8B91]">
            Track opening, current and damaged stock levels.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#D7E0E3] bg-[#F7F9FA]">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Product
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                SKU
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Opening
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Current
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Damaged
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Minimum
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => {
              const isLowStock =
                item.current_stock <=
                item.min_stock_level;

              return (
                <tr
                  key={item.id}
                  className="border-b border-[#EEF2F3] last:border-b-0 hover:bg-[#F9FBFB]"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#0F4C5C]">
                      {item.product_name}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#7A8B91]">
                    {item.sku}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-[#52646A]">
                    {item.opening_stock}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <span
                      className={
                        isLowStock
                          ? "font-bold text-orange-600"
                          : "font-semibold text-[#0F4C5C]"
                      }
                    >
                      {item.current_stock}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-red-600">
                    {item.damaged_stock}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-[#52646A]">
                    {item.min_stock_level}
                  </td>

                  <td className="px-5 py-4 text-center">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                        <AlertTriangle className="size-3.5" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}