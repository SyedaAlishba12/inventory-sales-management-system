import type { PosProduct } from "@/types/pos";

// Backend (FastAPI/Pydantic) returns snake_case; api-client does not
// transform casing, so map it here (same pattern as sale-mapper.ts).
interface RawPosProduct {
  id: string;
  name: string;
  sku: string;
  price: string | number;
  stock_quantity: number;
  image_url?: string | null;
}

export function mapPosProduct(raw: RawPosProduct): PosProduct {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    price: Number(raw.price),
    stockQuantity: raw.stock_quantity,
    imageUrl: raw.image_url ?? null,
  };
}

export function mapPosProductList(raw: RawPosProduct[]): PosProduct[] {
  return raw.map(mapPosProduct);
}
