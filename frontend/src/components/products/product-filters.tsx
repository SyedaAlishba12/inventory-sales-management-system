"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
}

export function ProductFilters({ searchQuery, onSearchChange, onAddClick }: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7A8B91]" />
        <Input
          placeholder="Search by product name or SKU..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="border-[#D7E0E3] text-[#0F4C5C]">
          <Filter className="mr-2 size-4" /> Filter Categories
        </Button>
      </div>
    </div>
  );
}