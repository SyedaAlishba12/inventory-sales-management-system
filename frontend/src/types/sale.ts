import type { Identifier } from "./index";

export type PaymentMethod = "CASH" | "CARD" | "ONLINE";
export type SaleStatus = "COMPLETED" | "PENDING" | "CANCELLED";

export interface SaleItemSummary {
  id: Identifier;
  productId: Identifier;
  quantity: number;
  unitPrice: number;
  itemDiscount: number;
  lineSubtotal: number;
}

export interface SaleSummary {
  id: Identifier;
  invoiceNumber: string;
  userId: Identifier;
  customerId?: Identifier | null;
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  createdAt: string;
  updatedAt: string;
  items: SaleItemSummary[];
}

export interface SaleListResponse {
  items: SaleSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
