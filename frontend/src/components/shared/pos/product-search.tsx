"use client";

import { Package, Search } from "lucide-react";

import { SearchBar } from "@/components/shared/search-bar";
import { Spinner } from "@/components/ui/spinner";
import type { PosProduct } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  results: PosProduct[];
  onSelect: (product: PosProduct) => void;
  loading?: boolean;
  minimumCharacters?: number;
}

export function ProductSearch({ loading, minimumCharacters = 1, onChange, onSelect, results, value }: ProductSearchProps) {
  const canShowResults = value.trim().length >= minimumCharacters;

  return (
    <div className="relative">
      <SearchBar value={value} onChange={onChange} placeholder="Search products by name or SKU..." />
      {canShowResults ? (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-card p-1 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Spinner />Searching products...</div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                disabled={product.stockQuantity <= 0}
                onClick={() => onSelect(product)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition hover:bg-muted focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
                  ) : <Package className="size-5 text-slate-300" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{product.name}</span>
                  <span className="block text-xs text-muted-foreground">{product.sku} · {product.stockQuantity} in stock</span>
                </span>
                <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center p-6 text-center text-sm text-muted-foreground">
              <Search className="mb-2 size-5" />
              No matching products
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
