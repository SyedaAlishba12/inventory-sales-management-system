"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Category } from "./category-table";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  initialData?: Category | null;
  mode: "add" | "edit";
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({ name, description });
      onClose();
    } catch (error) {
      console.error("Error submitting category form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-[#0F4C5C]">
            {mode === "add" ? "Add New Category" : "Edit Category"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics, Beverages"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this category..."
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90">
              {loading ? "Saving..." : mode === "add" ? "Create Category" : "Update Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}