"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { defaultNavigation } from "@/components/layout/navigation";
import { apiClient } from "@/utils/api-client";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { humanize } from "@/utils/format";
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
      .then((raw) => setSale(mapSale(raw)))
      .catch(() => setError("This invoice could not be found."))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [params.id]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const pdfUrl = `${apiBaseUrl}/api/sales/${params.id}/invoice/pdf`;

  return (
    <MainLayout navigation={defaultNavigation}>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <PageHeader
            title={sale ? `Invoice ${sale.invoiceNumber}` : "Invoice"}
            description="Review, print, or download this invoice."
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/sales")}>
              <ArrowLeft className="size-4" /> Back to Sales
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!sale}>
              <Printer className="size-4" /> Print
            </Button>
            <Button asChild disabled={!sale}>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Download className="size-4" /> Download PDF
              </a>
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
            title="Invoice not found"
            description={error}
            action={<Button onClick={() => router.push("/sales")}>Back to Sales</Button>}
          />
        )}

        {!loading && sale && (
          <Card className="mx-auto max-w-2xl print:border-0 print:shadow-none">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inventory & Sales Management System</p>
                  <h2 className="text-2xl font-bold">Invoice {sale.invoiceNumber}</h2>
                  <p className="text-sm text-muted-foreground">{formatDateTime(sale.saleDate)}</p>
                </div>
                <StatusBadge status={sale.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment method</p>
                  <p className="font-medium">{humanize(sale.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {sale.customerId ? String(sale.customerId) : "Walk-in customer"}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/70 text-left text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit price</th>
                      <th className="px-3 py-2 text-right">Discount</th>
                      <th className="px-3 py-2 text-right">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sale.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">{String(item.productId)}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.unitPrice, "PKR")}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.itemDiscount, "PKR")}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.lineSubtotal, "PKR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(sale.subtotal, "PKR")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-{formatCurrency(sale.discount, "PKR")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>{formatCurrency(sale.tax, "PKR")}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(sale.total, "PKR")}</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">Thank you for your purchase.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
