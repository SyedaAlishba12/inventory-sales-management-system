"use client";

import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  status: "Healthy" | "Low Stock";
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="rounded-xl border border-[#D7E0E3] bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#0F4C5C]">
          <thead className="border-b border-[#D7E0E3] bg-[#EAF0F2] text-xs uppercase tracking-wider text-[#52646A]">
            <tr>
              <th className="px-6 py-3 font-semibold">Product & SKU</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Cost Price</th>
              <th className="px-6 py-3 font-semibold">Selling Price</th>
              <th className="px-6 py-3 font-semibold">Stock</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E0E3]">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-[#EAF0F2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#0F4C5C]">{product.name}</div>
                    <div className="text-xs text-[#7A8B91]">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-[#52646A]">{product.category}</td>
                  <td className="px-6 py-4 text-[#52646A]">Rs {product.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-[#0F4C5C]">Rs {product.sellingPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold">{product.stock} units</td>
                  <td className="px-6 py-4">
                    {product.status === "Healthy" ? (
                      <Badge className="bg-[#52B788]/15 text-[#52B788] ring-[#52B788]/20">Healthy</Badge>
                    ) : (
                      <Badge className="bg-[#E67E72]/15 text-[#E67E72] ring-[#E67E72]/20 flex items-center gap-1 w-fit">
                        <AlertTriangle className="size-3" /> Low Stock
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="size-8 text-[#52646A] hover:text-[#0F4C5C]">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-[#52646A] hover:text-[#0F4C5C]">
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-[#E67E72] hover:bg-[#E67E72]/10">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[#7A8B91]">
                  No products found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}