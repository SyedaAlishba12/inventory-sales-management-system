import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { humanize } from "@/utils/format";
import { customerDisplayName } from "@/utils/sale-mapper";
import type { SaleSummary } from "@/types/sale";

interface SalesTableProps {
  sales: SaleSummary[];
  loading: boolean;
  onRowClick: (sale: SaleSummary) => void;
}

export function SalesTable({ sales, loading, onRowClick }: SalesTableProps) {
  const columns: DataTableColumn<SaleSummary>[] = [
    { id: "invoice", header: "Invoice #", accessor: (row) => row.invoiceNumber, sortable: true },
    {
      id: "date",
      header: "Date",
      accessor: (row) => formatDateTime(row.saleDate),
      sortValue: (row) => row.saleDate,
      sortable: true,
    },
    {
      id: "customer",
      header: "Customer",
      accessor: (row) => customerDisplayName(row),
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (row) => humanize(row.paymentMethod),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "total",
      header: "Total",
      accessor: (row) => formatCurrency(row.total, "PKR"),
      sortValue: (row) => row.total,
      sortable: true,
      align: "right",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sales}
      getRowId={(row) => row.id}
      loading={loading}
      emptyTitle="No sales found"
      emptyDescription="Try adjusting your filters, or complete a sale from the POS screen."
      onRowClick={onRowClick}
    />
  );
}
