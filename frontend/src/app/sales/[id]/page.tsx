"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";

import { SaleDetail } from "@/components/sales/sale-detail";
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

export default function SaleDetailPage() {
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
      .get<Parameters<typeof mapSale>[0]>(`/api/sales/${params.id}`, {
        signal: controller.signal,
      })
      .then((raw) => {
        setSale(mapSale(raw));
        setLoading(false);
      })
      .catch((err) => {
        // See invoices/[id]/page.tsx — check our own controller's signal,
        // not the error's name, since apiClient wraps AbortErrors into a
        // plain Error before it reaches this catch.
        if (controller.signal.aborted) return;
        setError("This sale could not be found.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [params.id]);

  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title={sale ? `Sale ${sale.invoiceNumber}` : "Sale details"}
            description="Full breakdown of this sale and its items."
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/sales")}>
              <ArrowLeft className="size-4" /> Back to Sales
            </Button>
            <Button
              disabled={!sale}
              onClick={() => router.push(`/invoices/${params.id}`)}
            >
              <Receipt className="size-4" /> View invoice
            </Button>
          </div>
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
            title="Sale not found"
            description={error}
            action={<Button onClick={() => router.push("/sales")}>Back to Sales</Button>}
          />
        )}

        {!loading && sale && <SaleDetail sale={sale} />}
      </div>
    </MainLayout>
  );
}
