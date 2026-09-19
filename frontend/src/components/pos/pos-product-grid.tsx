"use client";

import { Package, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/currency";
import type { PosProduct } from "@/types/pos";

interface PosProductGridProps {
  products: PosProduct[];
  loading: boolean;
  onSelect: (product: PosProduct) => void;
}

export function PosProductGrid({ products, loading, onSelect }: PosProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products available"
        description="Products will appear here once they're added to the catalog."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {products.map((product) => {
        const unavailable = product.stockQuantity <= 0;
        return (
          <Card key={product.id} className="overflow-hidden">
            <div className="flex aspect-square items-center justify-center bg-muted">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <Package className="size-8 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <CardContent className="space-y-1.5 p-2.5">
              <p className="truncate text-xs font-medium" title={product.name}>
                {product.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  {formatCurrency(product.price, "PKR")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={unavailable}
                  onClick={() => onSelect(product)}
                  className="h-7 px-2"
                >
                  <ShoppingCart className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
