import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ProductSummary } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ProductTableProps {
  products: ProductSummary[];
  loading?: boolean;
  actions?: (product: ProductSummary) => ReactNode;
  onProductClick?: (product: ProductSummary) => void;
}

export function ProductTable({ actions, loading, onProductClick, products }: ProductTableProps) {
  const columns: DataTableColumn<ProductSummary>[] = [
    { id: "name", header: "Product", accessor: "name", sortable: true },
    { id: "sku", header: "SKU", accessor: "sku", sortable: true },
    { id: "category", header: "Category", accessor: (product) => product.categoryName || "—", sortable: true, sortValue: (product) => product.categoryName },
    { id: "price", header: "Price", accessor: (product) => formatCurrency(product.sellingPrice), sortable: true, sortValue: (product) => product.sellingPrice, align: "right" },
    { id: "stock", header: "Stock", accessor: "stockQuantity", sortable: true, align: "right" },
    { id: "status", header: "Status", accessor: (product) => <StatusBadge status={product.stockQuantity <= 0 ? "out_of_stock" : product.stockQuantity <= product.minimumStock ? "low_stock" : "available"} /> },
  ];
  if (actions) columns.push({ id: "actions", header: "Actions", accessor: actions, align: "right" });

  return (
    <DataTable
      columns={columns}
      data={products}
      getRowId={(product) => product.id}
      loading={loading}
      onRowClick={onProductClick}
      emptyTitle="No products found"
      emptyDescription="Add a product or adjust the current filters."
    />
  );
}
