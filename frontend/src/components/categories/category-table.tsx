"use client";

import { useState } from "react";
import { Edit, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0F4C5C] text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Category Name</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold">Created At</th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  <FolderTree className="mx-auto size-8 mb-2 opacity-40" />
                  No categories found. Add your first category to get started.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{cat.name}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {cat.description || "No description provided"}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(cat.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(cat)}
                      className="h-8 px-2 text-[#0F4C5C] border-slate-200 hover:bg-slate-100"
                    >
                      <Edit className="size-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(cat.id)}
                      className="h-8 px-2 text-red-600 border-red-100 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}