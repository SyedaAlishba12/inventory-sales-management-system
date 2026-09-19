"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceDocument } from "@/components/invoices/invoice-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { apiClient } from "@/utils/api-client";
import { mapSale } from "@/utils/sale-mapper";
import type { SaleSummary } from "@/types/sale";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [sale, setSale] = useState<SaleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiClient
      .get<Parameters<typeof mapSale>[0]>(`/api/sales/${params.id}/invoice`, {
        signal: controller.signal,
      })
      .then((raw) => {
        setSale(mapSale(raw));
        setLoading(false);
      })
      .catch((err) => {
        // apiClient converts every AbortError into a plain Error before it
        // reaches here (loses err.name === "AbortError"), so checking the
        // error type doesn't work. Checking our OWN controller's signal is
        // reliable regardless of what apiClient does internally: if WE
        // aborted this specific fetch (via the cleanup below), skip it —
        // a later, successful re-run already set the real state.
        if (controller.signal.aborted) return;
        setError("This invoice could not be found.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [params.id]);

  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <PageHeader
            title={sale ? `Invoice ${sale.invoiceNumber}` : "Invoice"}
            description="Review, print, or download this invoice."
          />
          <InvoiceActions
            disabled={!sale}
            saleId={params.id}
            invoiceNumber={sale?.invoiceNumber}
            onBack={() => router.push("/sales")}
          />
        </div>

        {loading && (
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <ErrorState
            title="Invoice not found"
            description={error}
            action={<Button onClick={() => router.push("/sales")}>Back to Sales</Button>}
          />
        )}

        {!loading && sale && <InvoiceDocument sale={sale} />}
      </div>
    </MainLayout>
  );
}
