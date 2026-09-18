"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleAlert,
  History,
  Settings2,
  Trash2,
} from "lucide-react";

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name: string;
  movement_type:
    | "STOCK_IN"
    | "STOCK_OUT"
    | "DAMAGED"
    | "ADJUSTMENT";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string | null;
  user_id: string;
  user_name?: string;
  created_at: string;
}

interface InventoryMovementTableProps {
  movements: InventoryMovement[];
}

const movementConfig = {
  STOCK_IN: {
    label: "Stock In",
    icon: ArrowDownToLine,
    className: "bg-green-50 text-green-700",
  },

  STOCK_OUT: {
    label: "Stock Out",
    icon: ArrowUpFromLine,
    className: "bg-blue-50 text-blue-700",
  },

  DAMAGED: {
    label: "Damaged",
    icon: Trash2,
    className: "bg-red-50 text-red-700",
  },

  ADJUSTMENT: {
    label: "Adjustment",
    icon: Settings2,
    className: "bg-purple-50 text-purple-700",
  },
};

export function InventoryMovementTable({
  movements,
}: InventoryMovementTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D7E0E3] bg-white shadow-sm">
      <div className="border-b border-[#D7E0E3] px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="size-5 text-[#0F4C5C]" />

          <div>
            <h2 className="font-semibold text-[#0F4C5C]">
              Inventory Movements
            </h2>

            <p className="mt-1 text-xs text-[#7A8B91]">
              Every stock change is recorded here.
            </p>
          </div>
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="py-12 text-center">
          <History className="mx-auto mb-3 size-10 text-[#A8B5B9]" />

          <p className="font-medium text-[#0F4C5C]">
            No movements found
          </p>

          <p className="mt-1 text-sm text-[#7A8B91]">
            Stock movements will appear here after inventory changes.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#D7E0E3] bg-[#F7F9FA]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Movement Type
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Quantity
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Previous
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  New Stock
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Reason
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  User
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#52646A]">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => {
                const config =
                  movementConfig[
                    movement.movement_type
                  ];

                const Icon = config.icon;

                return (
                  <tr
                    key={movement.id}
                    className="border-b border-[#EEF2F3] last:border-b-0 hover:bg-[#F9FBFB]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#0F4C5C]">
                        {movement.product_name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
                      >
                        <Icon className="size-3.5" />

                        {config.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-[#0F4C5C]">
                      {movement.quantity}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-[#52646A]">
                      {movement.previous_stock}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-[#0F4C5C]">
                      {movement.new_stock}
                    </td>

                    <td className="max-w-[220px] px-5 py-4 text-sm text-[#52646A]">
                      {movement.reason || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52646A]">
                      {movement.user_name || "User"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#7A8B91]">
                      {new Date(
                        movement.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}