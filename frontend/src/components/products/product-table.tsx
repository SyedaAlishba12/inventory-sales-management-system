"use client";

import {
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId: string;

  sellingPrice: number;
  costPrice: number;

  stock: number;
  minStock: number;

  status: "Healthy" | "Low Stock";

  image_url?: string | null;
}

interface ProductTableProps {
  products: Product[];

  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;

  isAdmin: boolean;
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
  isAdmin,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D7E0E3] bg-card shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm text-[#0F4C5C]">

          <thead className="border-b border-[#D7E0E3] bg-[#EAF0F2] text-xs uppercase tracking-wider text-[#52646A]">

            <tr>

              <th className="px-6 py-3 font-semibold">
                Product
              </th>

              <th className="px-6 py-3 font-semibold">
                Category
              </th>

              <th className="px-6 py-3 font-semibold">
                Cost Price
              </th>

              <th className="px-6 py-3 font-semibold">
                Selling Price
              </th>

              <th className="px-6 py-3 font-semibold">
                Stock
              </th>

              <th className="px-6 py-3 font-semibold">
                Status
              </th>

              <th className="px-6 py-3 text-center font-semibold">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-[#D7E0E3]">

            {products.length > 0 ? (

              products.map((product) => (

                <tr
                  key={product.id}
                  className="transition-colors hover:bg-[#EAF0F2]/50"
                >

                  {/* PRODUCT */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#D7E0E3] bg-[#F5F8F9]">

                        {product.image_url ? (

                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div className="flex h-full w-full items-center justify-center text-xs text-[#7A8B91]">
                            No Image
                          </div>

                        )}

                      </div>

                      <div>

                        <div className="font-semibold text-[#0F4C5C]">
                          {product.name}
                        </div>

                        <div className="text-xs text-[#7A8B91]">
                          SKU: {product.sku}
                        </div>

                      </div>

                    </div>

                  </td>

                  {/* CATEGORY */}

                  <td className="px-6 py-4 text-[#52646A]">
                    {product.category}
                  </td>

                  {/* COST */}

                  <td className="px-6 py-4 text-[#52646A]">
                    Rs {product.costPrice.toLocaleString()}
                  </td>

                  {/* SELLING */}

                  <td className="px-6 py-4 font-medium text-[#0F4C5C]">
                    Rs {product.sellingPrice.toLocaleString()}
                  </td>

                  {/* STOCK */}

                  <td className="px-6 py-4 font-semibold">
                    {product.stock} units
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4">

                    {product.status === "Healthy" ? (

                      <Badge className="bg-[#52B788]/15 text-[#52B788] ring-[#52B788]/20">
                        Healthy
                      </Badge>

                    ) : (

                      <Badge className="flex w-fit items-center gap-1 bg-[#E67E72]/15 text-[#E67E72] ring-[#E67E72]/20">

                        <AlertTriangle className="size-3" />

                        Low Stock

                      </Badge>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-4 text-right">

                    <div className="flex items-center justify-end gap-1">

                      {/* VIEW — ADMIN + STAFF */}

                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Product"
                        onClick={() =>
                          onView(product)
                        }
                        className="size-8 text-[#52646A] hover:text-[#0F4C5C]"
                      >
                        <Eye className="size-4" />
                      </Button>

                      {/* EDIT — ADMIN ONLY */}

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Product"
                          onClick={() =>
                            onEdit(product)
                          }
                          className="size-8 text-[#52646A] hover:text-[#0F4C5C]"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}

                      {/* DELETE — ADMIN ONLY */}

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Product"
                          onClick={() =>
                            onDelete(product)
                          }
                          className="size-8 text-[#E67E72] hover:bg-[#E67E72]/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-[#7A8B91]"
                >
                  No products found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}