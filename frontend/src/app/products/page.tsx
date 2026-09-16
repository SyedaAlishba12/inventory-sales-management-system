"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductTable, type Product } from "@/components/products/product-table";
import { ProductFormModal } from "@/components/products/product-form-modal";

const initialProducts: Product[] = [
  { id: "1", name: "Wireless Mouse", sku: "MOUSE-001", category: "Electronics", sellingPrice: 2500, costPrice: 1800, stock: 36, minStock: 10, status: "Healthy" },
  { id: "2", name: "Mechanical Keyboard", sku: "KEY-014", category: "Electronics", sellingPrice: 8500, costPrice: 6500, stock: 6, minStock: 10, status: "Low Stock" },
  { id: "3", name: "Type-C Fast Charger", sku: "CHG-992", category: "Accessories", sellingPrice: 1500, costPrice: 900, stock: 45, minStock: 15, status: "Healthy" },
  { id: "4", name: "HD Monitor 24-inch", sku: "MON-240", category: "Displays", sellingPrice: 32000, costPrice: 27000, stock: 4, minStock: 5, status: "Low Stock" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleAddProduct = (newProdData: {
    name: string;
    sku: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    stock: number;
    minStock: number;
  }) => {
    const product: Product = {
      id: String(products.length + 1),
      ...newProdData,
      status: newProdData.stock <= newProdData.minStock ? "Low Stock" : "Healthy",
    };
    setProducts([product, ...products]);
    setIsAddModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">Product Management</h1>
            <p className="text-sm text-[#7A8B91]">Manage your inventory items, pricing, stock levels, and SKUs.</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90">
            <Plus className="mr-2 size-4" /> Add New Product
          </Button>
        </div>

        {/* Filters and Search */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setIsAddModalOpen(true)}
        />

        {/* Product Table */}
        <ProductTable products={filteredProducts} />

        {/* Add Product Modal */}
        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      </div>
    </MainLayout>
  );
}