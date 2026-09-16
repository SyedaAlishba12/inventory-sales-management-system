"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SalesFilters } from "@/components/sales/sales-filters";
import { SalesTable } from "@/components/sales/sales-table";
import { Pagination } from "@/components/ui/pagination";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { apiClient } from "@/utils/api-client";
import { mapSaleList } from "@/utils/sale-mapper";
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

        <SalesFilters
          paymentMethod={paymentMethod}
          onPaymentMethodChange={(value) => {
            setPaymentMethod(value);
            setPage(1);
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          onReset={resetFilters}
        />

        <SalesTable
          sales={sales}
          loading={loading}
          onRowClick={(row) => router.push(`/sales/${row.id}`)}
        />

        {!loading && sales.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </MainLayout>
  );
}
