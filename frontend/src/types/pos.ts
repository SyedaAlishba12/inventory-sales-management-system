import type { Identifier } from "./index";

export type PaymentMethod = "cash" | "card" | "online";

export interface CartLine {
  productId: Identifier;
  name: string;
  sku: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

export interface PosProduct {
  id: Identifier;
  name: string;
  sku: string;
  imageUrl?: string | null;
  price: number;
  stockQuantity: number;
}
