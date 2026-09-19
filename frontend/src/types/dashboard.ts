export interface DashboardStats {
  total_sales: number;
  todays_sales: number;
  total_products: number;
  low_stock_products: number;
  total_customers: number;
  pending_orders: number;
  monthly_revenue: number;
}

export interface DailySalesPoint {
  date: string;
  sales: number;
}

export interface MonthlySalesPoint {
  month: string;
  sales: number;
}

export interface TopProductPoint {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface CategoryRevenuePoint {
  category_id: string;
  category_name: string;
  revenue: number;
}

export interface LowStockItem {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  min_stock_level: number;
}

export interface InventoryOverviewItem {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  min_stock_level: number;
  status: "Healthy" | "Low";
}

export interface RecentSale {
  id: string;
  invoice_number: string;
  customer_name: string;
  total: number;
  payment_method: string;
  status: string;
  sale_date: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  daily_sales: DailySalesPoint[];
  monthly_sales: MonthlySalesPoint[];
  top_products: TopProductPoint[];
  category_revenue: CategoryRevenuePoint[];
  low_stock_items: LowStockItem[];
  recent_sales: RecentSale[];
  inventory_overview: InventoryOverviewItem[];
}