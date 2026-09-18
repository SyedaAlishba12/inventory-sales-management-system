"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  PackageOpen,
  TriangleAlert,
} from "lucide-react";

interface InventoryStatsProps {
  openingStock: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  damagedStock: number;
  lowStockCount: number;
}

export function InventoryStats({
  openingStock,
  stockIn,
  stockOut,
  currentStock,
  damagedStock,
  lowStockCount,
}: InventoryStatsProps) {
  const stats = [
    {
      label: "Opening Stock",
      value: openingStock,
      icon: Box,
      iconClass: "text-[#0F4C5C]",
      bgClass: "bg-[#E8F1F3]",
    },
    {
      label: "Stock In",
      value: stockIn,
      icon: ArrowDownToLine,
      iconClass: "text-green-600",
      bgClass: "bg-green-50",
    },
    {
      label: "Stock Out",
      value: stockOut,
      icon: ArrowUpFromLine,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      label: "Current Stock",
      value: currentStock,
      icon: PackageOpen,
      iconClass: "text-[#0F4C5C]",
      bgClass: "bg-[#E8F1F3]",
    },
    {
      label: "Damaged Stock",
      value: damagedStock,
      icon: TriangleAlert,
      iconClass: "text-red-600",
      bgClass: "bg-red-50",
    },
    {
      label: "Low Stock Items",
      value: lowStockCount,
      icon: TriangleAlert,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-[#D7E0E3] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#7A8B91]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#0F4C5C]">
                  {stat.value}
                </p>
              </div>

              <div
                className={`rounded-lg p-2 ${stat.bgClass}`}
              >
                <Icon
                  className={`size-5 ${stat.iconClass}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}