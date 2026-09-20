"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FolderTree } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { CategoryTable, type Category } from "@/components/categories/category-table";
import { CategoryFormModal } from "@/components/categories/category-form-modal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Add or Edit form submission
  const handleFormSubmit = async (formData: { name: string; description: string }) => {
    if (modalMode === "add") {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create category");
    } else if (modalMode === "edit" && selectedCategory) {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update category");
    }
    await fetchCategories();
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Could not delete category. Ensure no products are attached to it.");
    }
  };

  // Filtered categories based on search input
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">Category Management</h1>
            <p className="text-sm text-[#7A8B91]">Organize your products into structured inventory categories.</p>
          </div>
          <Button
            onClick={() => {
              setModalMode("add");
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
            className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90"
          >
            <Plus className="mr-2 size-4" /> Add Category
          </Button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <Search className="size-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Categories Table */}
        <CategoryTable
          categories={filteredCategories}
          onEdit={(cat) => {
            setModalMode("edit");
            setSelectedCategory(cat);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteCategory}
        />

        {/* Form Modal */}
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedCategory}
          mode={modalMode}
        />
      </div>
    </MainLayout>
  );
}