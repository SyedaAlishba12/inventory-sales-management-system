"use client";

import {
  Search,
  Filter,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;

  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;

  categories: Category[];
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      {/* SEARCH */}

      <div className="relative w-full max-w-sm">

        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7A8B91]" />

        <Input
          placeholder="Search by product name or SKU..."
          value={searchQuery}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          className="pl-9"
        />

      </div>


      {/* CATEGORY FILTER */}

      <div className="flex items-center gap-2">

        <div className="flex items-center gap-2">

          <Filter className="size-4 text-[#52646A]" />

          <select
            value={selectedCategory}
            onChange={(e) =>
              onCategoryChange(e.target.value)
            }
            className="rounded-md border border-[#D7E0E3] bg-white px-3 py-2 text-sm text-[#0F4C5C] focus:outline-none"
          >

            <option value="">
              All Categories
            </option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>

        </div>


        {/* CLEAR FILTER */}

        {selectedCategory && (

          <Button
            variant="outline"
            size="icon"
            title="Clear category filter"
            onClick={() =>
              onCategoryChange("")
            }
            className="border-[#D7E0E3] text-[#0F4C5C]"
          >

            <X className="size-4" />

          </Button>

        )}

      </div>

    </div>
  );
}