"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: {
    name: string;
    sku: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    stock: number;
    minStock: number;
  }) => void;
}

export function ProductFormModal({ isOpen, onClose, onAddProduct }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    minStock: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name: formData.name,
      sku: formData.sku,
      category: formData.category || "General",
      sellingPrice: Number(formData.sellingPrice) || 0,
      costPrice: Number(formData.costPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 5,
    });
    setFormData({ name: "", sku: "", category: "", sellingPrice: "", costPrice: "", stock: "", minStock: "" });
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="Add New Product"
      description="Enter the details of the new product to add to inventory."
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#0F4C5C] text-white">
            Save Product
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Product Name</label>
          <Input
            required
            placeholder="e.g. Wireless Mouse"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">SKU Code</label>
            <Input
              required
              placeholder="e.g. MOUSE-002"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Category</label>
            <Input
              placeholder="e.g. Electronics"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Cost Price (Rs)</label>
            <Input
              type="number"
              required
              placeholder="1800"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Selling Price (Rs)</label>
            <Input
              type="number"
              required
              placeholder="2500"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Initial Stock</label>
            <Input
              type="number"
              required
              placeholder="50"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">Minimum Stock Alert</label>
            <Input
              type="number"
              required
              placeholder="10"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}