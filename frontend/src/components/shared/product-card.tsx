import { Package, ShoppingCart } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductSummary } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  product: ProductSummary;
  onSelect?: (product: ProductSummary) => void;
  actionLabel?: string;
}

export function ProductCard({ actionLabel = "Add", onSelect, product }: ProductCardProps) {
  const lowStock = product.stockQuantity <= product.minimumStock;
  const unavailable = product.stockQuantity <= 0 || product.isActive === false;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-muted">
        {product.imageUrl ? (
          // Product images may come from the team API or a configured object store.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <Package className="size-12 text-slate-300" aria-hidden="true" />
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={unavailable ? "out_of_stock" : lowStock ? "low_stock" : "available"} />
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.categoryName || "Uncategorized"}</p>
        <h3 className="mt-1 truncate font-semibold" title={product.name}>{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-bold text-primary">{formatCurrency(product.sellingPrice)}</p>
            <p className="text-xs text-muted-foreground">{product.stockQuantity} in stock</p>
          </div>
          {onSelect ? (
            <Button size="sm" disabled={unavailable} onClick={() => onSelect(product)}>
              <ShoppingCart className="size-4" />
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
