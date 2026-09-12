"use client";

import { useEffect, useState, useCallback, use } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type { SupplierResponse, SupplierUpdate } from "@/types/supplier";
import type { PurchaseResponse } from "@/types/purchase";
import { toastUtils } from "@/utils/toast";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [supplier, setSupplier] = useState<SupplierResponse | null>(null);
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSupplierData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [supplierData, purchasesData] = await Promise.all([
        apiClient.get<SupplierResponse>(`/api/suppliers/${id}`),
        apiClient.get<PurchaseResponse[]>(`/api/suppliers/${id}/purchases`).catch(() => [])
      ]);
      setSupplier(supplierData);
      setPurchases(purchasesData);
    } catch (err) {
      toastUtils.error(err, "Error fetching supplier");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const handleEditSupplier = async (data: SupplierUpdate) => {
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/api/suppliers/${id}`, data);
      toastUtils.success("Supplier updated successfully");
      setIsEditOpen(false);
      fetchSupplierData();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/suppliers/${id}`);
      toastUtils.success("Supplier deleted successfully");
      router.push("/suppliers");
    } catch (err) {
      toastUtils.error(err, "Error deleting supplier");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns: DataTableColumn<PurchaseResponse>[] = [
    {
      id: "id",
      header: "Purchase ID",
      accessor: "id",
      className: "font-mono text-xs",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusBadge status={row.purchase_status} />,
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (row) => <StatusBadge status={row.payment_status} />,
    },
    {
      id: "total",
      header: "Total",
      accessor: (row) => formatCurrency(Number(row.total_amount)),
      align: "right",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold mb-4">Supplier not found</h2>
        <Button onClick={() => router.push("/suppliers")}>Back to Suppliers</Button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/suppliers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">{supplier.name}</h1>
            <p className="text-sm text-muted-foreground">{supplier.contact_person ? `Contact: ${supplier.contact_person} • ` : ""}{supplier.email || "No email"} • {supplier.phone || "No phone"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <p className="text-sm">{supplier.address || "No address provided."}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Purchase Orders</h2>
          <DataTable
            columns={columns}
            data={purchases}
            getRowId={(row) => row.id}
            emptyTitle="No purchases"
            emptyDescription="You haven't made any purchases from this supplier yet."
          />
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm
              initialData={supplier}
              onSubmit={handleEditSupplier as any}
              onCancel={() => setIsEditOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Supplier"
          description={`Are you sure you want to delete ${supplier.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
          loading={isDeleting}
          onConfirm={handleDeleteSupplier}
        />
      </div>
    </AuthGuard>
  );
}
