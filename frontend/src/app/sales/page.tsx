"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { apiClient } from "@/utils/api-client";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { mapSaleList } from "@/utils/sale-mapper";
import { humanize } from "@/utils/format";
import type { SaleSummary } from "@/types/sale";

const PAGE_SIZE = 20;

export default function SalesHistoryPage() {
  const router = useRouter();

  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    apiClient
      .get<Parameters<typeof mapSaleList>[0]>("/api/sales", {
        query: {
          page,
          page_size: PAGE_SIZE,
          payment_method: paymentMethod || undefined,
          status: status || undefined,
        },
        signal: controller.signal,
      })
      .then((raw) => {
        const mapped = mapSaleList(raw);
        setSales(mapped.items);
        setTotalPages(mapped.totalPages || 1);
      })
      .catch(() => {
        setSales([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, paymentMethod, status]);

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
      accessor: (row) => (row.customerId ? String(row.customerId) : "Walk-in"),
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

  function resetFilters() {
    setPaymentMethod("");
    setStatus("");
    setPage(1);
  }

  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <PageHeader
          title="Sales History"
          description="All completed and pending sales, with invoice access."
        />

        <FilterBar hasActiveFilters={!!(paymentMethod || status)} onReset={resetFilters}>
          <Select
            value={paymentMethod || undefined}
            onValueChange={(value) => {
              setPaymentMethod(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status || undefined}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>

        <DataTable
          columns={columns}
          data={sales}
          getRowId={(row) => row.id}
          loading={loading}
          emptyTitle="No sales found"
          emptyDescription="Try adjusting your filters, or complete a sale from the POS screen."
          onRowClick={(row) => router.push(`/invoices/${row.id}`)}
        />

        {!loading && sales.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </MainLayout>
  );
}
