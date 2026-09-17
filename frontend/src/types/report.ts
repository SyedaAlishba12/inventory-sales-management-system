export interface ReportDateRange {
  start_date?: string;
  end_date?: string;
}

export interface SalesReportSummary {
  total_sales: number;
  total_transactions: number;
  average_sale: number;
}

export interface SalesReportRow {
  id: string;
  invoice_number: string;
  customer_name: string;
  sale_date: string;
  payment_method: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesReportResponse {
  summary: SalesReportSummary;
  rows: SalesReportRow[];
}

export interface ProductSalesRow {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_sold: number;
  revenue: number;
}

export interface ProductReportResponse {
  rows: ProductSalesRow[];
}

export interface InventoryReportRow {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  opening_stock: number;
  damaged_stock: number;
  min_stock_level: number;
}

export interface InventoryReportResponse {
  rows: InventoryReportRow[];
}

export interface CustomerReportRow {
  customer_id: string;
  customer_name: string;
  phone?: string | null;
  email?: string | null;
  total_purchases: number;
  total_spending: number;
}

export interface CustomerReportResponse {
  rows: CustomerReportRow[];
}

export interface SupplierReportRow {
  supplier_id: string;
  supplier_name: string;
  total_purchases: number;
  total_purchase_amount: number;
  pending_amount: number;
}

export interface SupplierReportResponse {
  rows: SupplierReportRow[];
}

export interface PurchaseReportRow {
  purchase_id: string;
  supplier_name: string;
  purchase_date: string;
  payment_status: string;
  purchase_status: string;
  total_cost: number;
  notes?: string | null;
}

export interface PurchaseReportResponse {
  rows: PurchaseReportRow[];
}

export type ReportType =
  | "sales"
  | "products"
  | "inventory"
  | "customers"
  | "suppliers"
  | "purchases";

