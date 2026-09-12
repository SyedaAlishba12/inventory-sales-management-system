"use client";

import { useEffect, useState, useCallback, use } from "react";
import { ArrowLeft, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type { PurchaseResponse, PurchaseItemResponse } from "@/types/purchase";
import { toastUtils } from "@/utils/toast";
import { formatCurrency } from "@/utils/currency";
import type { ProductSummary } from "@/types/product";
import type { SupplierResponse } from "@/types/supplier";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [purchase, setPurchase] = useState<PurchaseResponse | null>(null);
  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [productMap, setProductMap] = useState<Map<string, string>>(new Map());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const purchaseData = await apiClient.get<PurchaseResponse>(`/api/purchases/${id}`);
      setPurchase(purchaseData);
      
      const [supplierData, productsData] = await Promise.all([
        apiClient.get<SupplierResponse>(`/api/suppliers/${purchaseData.supplier_id}`).catch(() => null),
        apiClient.get<ProductSummary[]>("/api/products").catch(() => [])
      ]);
      
      setSupplier(supplierData);
      setProductMap(new Map(productsData.map((p: ProductSummary) => [p.id as string, p.name])));
    } catch (err) {
      toastUtils.error(err, "Error fetching purchase order");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReceive = async () => {
    setIsReceiving(true);
    try {
      // The prompt mentioned PATCH /api/purchases/:id/receive
      await apiClient.patch(`/api/purchases/${id}/receive`, {});
      toastUtils.success("Purchase order marked as received");
      fetchData(); // Refresh the data to show the new status
    } catch (err) {
      toastUtils.error(err, "Error receiving order");
      setIsReceiving(false);
    }
  };

  const columns: DataTableColumn<PurchaseItemResponse>[] = [
    {
      id: "product",
      header: "Product",
      accessor: (row) => productMap.get(row.product_id) || "Unknown Product",
    },
    {
      id: "qty",
      header: "Quantity",
      accessor: "quantity",
    },
    {
      id: "unit_price",
      header: "Unit Cost",
      accessor: (row) => formatCurrency(Number(row.unit_price)),
      align: "right",
    },
    {
      id: "total_price",
      header: "Line Total",
      accessor: (row) => formatCurrency(Number(row.total_price)),
      align: "right",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold mb-4">Purchase Order not found</h2>
        <Button onClick={() => router.push("/purchases")}>Back to Purchases</Button>
      </div>
    );
  }

  const isPending = purchase.purchase_status.toLowerCase() === "pending";

  return (
    <AuthGuard>
      <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/purchases">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C] font-mono">PO: {purchase.id.split('-')[0]}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={purchase.purchase_status} />
                <StatusBadge status={purchase.payment_status} />
              </div>
            </div>
          </div>
          
          {isPending && (
            <Button 
              onClick={handleReceive} 
              disabled={isReceiving}
              className="bg-[#2E7D32] hover:bg-[#1B5E20]"
            >
              <Package className="mr-2 size-4" />
              {isReceiving ? "Receiving..." : "Mark as Received"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Order Details
            </h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-muted-foreground">Order ID</div>
              <div className="font-mono text-xs">{purchase.id}</div>
              
              <div className="text-muted-foreground">Supplier</div>
              <div className="font-medium">
                {supplier ? (
                  <Link href={`/suppliers/${supplier.id}`} className="text-primary hover:underline">
                    {supplier.name}
                  </Link>
                ) : "Unknown Supplier"}
              </div>
              
              <div className="text-muted-foreground">Order Total</div>
              <div className="font-bold text-lg">{formatCurrency(Number(purchase.total_amount))}</div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {purchase.notes || "No notes provided for this order."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Line Items</h2>
          <DataTable
            columns={columns}
            data={purchase.items}
            getRowId={(row) => row.id}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
