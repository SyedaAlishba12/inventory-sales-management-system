import type { SaleItemSummary, SaleListResponse, SaleSummary } from "@/types/sale";

// Backend (FastAPI/Pydantic) responses are snake_case; api-client does not
// transform casing, so each domain maps its own responses. Keep this in one
// place so every page (Sales History, Invoice view, POS) stays consistent.

interface RawSaleItem {
  id: string;
  product_id: string;
  product_name?: string | null;
  quantity: number;
  unit_price: string | number;
  item_discount: string | number;
  line_subtotal: string | number;
}

interface RawSale {
  id: string;
  invoice_number: string;
  user_id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  sale_date: string;
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  payment_method: SaleSummary["paymentMethod"];
  status: SaleSummary["status"];
  created_at: string;
  updated_at: string;
  items: RawSaleItem[];
}

interface RawSaleListResponse {
  items: RawSale[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

function mapSaleItem(raw: RawSaleItem): SaleItemSummary {
  return {
    id: raw.id,
    productId: raw.product_id,
    productName: raw.product_name?.trim() || "Unknown product",
    quantity: raw.quantity,
    unitPrice: Number(raw.unit_price),
    itemDiscount: Number(raw.item_discount),
    lineSubtotal: Number(raw.line_subtotal),
  };
}

export function mapSale(raw: RawSale): SaleSummary {
  return {
    id: raw.id,
    invoiceNumber: raw.invoice_number,
    userId: raw.user_id,
    customerId: raw.customer_id,
    customerName: raw.customer_name ?? null,
    saleDate: raw.sale_date,
    subtotal: Number(raw.subtotal),
    discount: Number(raw.discount),
    tax: Number(raw.tax),
    total: Number(raw.total),
    paymentMethod: raw.payment_method,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    items: (raw.items || []).map(mapSaleItem),
  };
}

export function mapSaleList(raw: RawSaleListResponse): SaleListResponse {
  return {
    items: raw.items.map(mapSale),
    page: raw.page,
    pageSize: raw.page_size,
    total: raw.total,
    totalPages: raw.total_pages,
  };
}

export function customerDisplayName(sale: SaleSummary): string {
  return sale.customerName?.trim() || "Walk-in customer";
}
