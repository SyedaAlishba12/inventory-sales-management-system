"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/utils/api-client";
import { toastUtils } from "@/utils/toast";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import type { PurchaseResponse } from "@/types/purchase";
import type { SupplierResponse } from "@/types/supplier";

export default function PurchasesPage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<(PurchaseResponse & { supplier_name?: string })[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [purchasesData, suppliersData] = await Promise.all([
        apiClient.get<PurchaseResponse[]>("/api/purchases"),
        apiClient.get<SupplierResponse[]>("/api/suppliers")
      ]);
      
      const supplierMap = new Map(suppliersData.map(s => [s.id, s.name]));
      
      setPurchases(purchasesData.map(p => ({
        ...p,
        supplier_name: supplierMap.get(p.supplier_id) || "Unknown Supplier"
      })));
      setSuppliers(suppliersData);
    } catch (err) {
      toastUtils.error(err, "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPurchases = purchases.filter(p => {
    if (statusFilter !== "all" && p.purchase_status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const columns: DataTableColumn<PurchaseResponse & { supplier_name?: string }>[] = [
    {
      id: "id",
      header: "PO Number",
      accessor: "id",
      className: "font-mono text-xs",
    },
    {
      id: "supplier",
      header: "Supplier",
      accessor: "supplier_name",
      sortable: true,
    },
    {
      id: "status",
      header: "Purchase Status",
      accessor: (row) => <StatusBadge status={row.purchase_status} />,
      sortable: true,
      sortValue: (row) => row.purchase_status,
    },
    {
      id: "payment",
      header: "Payment Status",
      accessor: (row) => <StatusBadge status={row.payment_status} />,
    },
    {
      id: "total",
      header: "Total Cost",
      accessor: (row) => formatCurrency(Number(row.total_amount)),
      align: "right",
      sortable: true,
      sortValue: (row) => Number(row.total_amount),
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">Purchases</h1>
            <p className="text-sm text-muted-foreground">Manage your purchase orders and incoming inventory.</p>
          </div>
          <Button asChild>
            <Link href="/purchases/new">
              <Plus className="mr-2 size-4" />
              New Purchase Order
            </Link>
          </Button>
        </div>

        <FilterBar 
          hasActiveFilters={statusFilter !== "all"}
          onReset={() => setStatusFilter("all")}
        >
          <select 
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 max-w-[200px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FilterBar>

        <DataTable
          columns={columns}
          data={filteredPurchases}
          getRowId={(row) => row.id}
          loading={isLoading}
          onRowClick={(row) => router.push(`/purchases/${row.id}`)}
          emptyTitle="No purchases found"
          emptyDescription="You haven't created any purchase orders yet."
        />
      </div>
    </AuthGuard>
  );
}
