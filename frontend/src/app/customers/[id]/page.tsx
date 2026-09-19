"use client";

import { useEffect, useState, useCallback, use } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
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
import type {
  CustomerResponse,
  CustomerUpdate,
} from "@/types/customer";
import type { PurchaseResponse } from "@/types/purchase";
import { toastUtils } from "@/utils/toast";
import { formatCurrency } from "@/utils/currency";

function CustomerDetailContent({ id }: { id: string }) {
  const router = useRouter();

  const [customer, setCustomer] =
    useState<CustomerResponse | null>(null);

  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [customerData, purchasesData] = await Promise.all([
        apiClient.get<CustomerResponse>(`/api/customers/${id}`),

        apiClient
          .get<PurchaseResponse[]>(
            `/api/customers/${id}/purchases`,
          )
          .catch(() => []), // Fallback to empty array if not implemented yet
      ]);

      setCustomer(customerData);
      setPurchases(purchasesData);
    } catch (err) {
      toastUtils.error(err, "Error fetching customer");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleEditCustomer = async (data: CustomerUpdate) => {
    setIsSubmitting(true);

    try {
      await apiClient.patch(`/api/customers/${id}`, data);

      toastUtils.success("Customer updated successfully");

      setIsEditOpen(false);

      fetchCustomerData();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    setIsDeleting(true);

    try {
      await apiClient.delete(`/api/customers/${id}`);

      toastUtils.success("Customer deleted successfully");

      router.push("/customers");
    } catch (err) {
      toastUtils.error(err, "Error deleting customer");
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
      accessor: (row) => (
        <StatusBadge status={row.purchase_status} />
      ),
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (row) => (
        <StatusBadge status={row.payment_status} />
      ),
    },
    {
      id: "total",
      header: "Total",
      accessor: (row) =>
        formatCurrency(Number(row.total_amount)),
      align: "right",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-6 h-8 w-64" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
        <h2 className="mb-4 text-xl font-bold">
          Customer not found
        </h2>

        <Button onClick={() => router.push("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">
            {customer.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            {customer.email || "No email"} •{" "}
            {customer.phone || "No phone"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="mr-2 size-4" />
            Edit
          </Button>

          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Address</h2>

        <p className="text-sm">
          {customer.address || "No address provided."}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Purchase History</h2>

        <DataTable
          columns={columns}
          data={purchases}
          getRowId={(row) => row.id}
          emptyTitle="No purchases"
          emptyDescription="This customer has not made any purchases yet."
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>

          <CustomerForm
            initialData={customer}
            onSubmit={handleEditCustomer as any}
            onCancel={() => setIsEditOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        onConfirm={handleDeleteCustomer}
      />
    </div>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAdmin>
      <CustomerDetailContent id={resolvedParams.id} />
    </AuthGuard>
  );
}