import type { Identifier } from "./index";

export interface ProductSummary {
  id: Identifier;
  name: string;
  sku: string;
  categoryName?: string;
  imageUrl?: string | null;
  sellingPrice: number;
  stockQuantity: number;
  minimumStock: number;
  isActive?: boolean;
}
