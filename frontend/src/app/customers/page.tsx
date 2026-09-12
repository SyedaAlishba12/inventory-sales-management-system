"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type { CustomerCreate, CustomerSummary } from "@/types/customer";
import { toastUtils } from "@/utils/toast";

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<CustomerSummary[]>("/api/customers", {
        query: searchQuery ? { search: searchQuery } : undefined,
      });
      setCustomers(data);
    } catch (err) {
      toastUtils.error(err, "Error fetching customers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(debouncedSearch);
  }, [debouncedSearch, fetchCustomers]);

  const handleAddCustomer = async (data: CustomerCreate) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/customers", data);
      toastUtils.success("Customer added successfully");
      setIsAddOpen(false);
      fetchCustomers(debouncedSearch);
    } catch (err) {
      throw err; // Form component will catch and show it
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<CustomerSummary>[] = [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: "phone",
    },
    {
      id: "purchaseCount",
      header: "Purchases",
      accessor: "purchaseCount",
      align: "right",
      sortable: true,
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage your customer database and view their purchase history.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Customer
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search customers by name, email, or phone..."
            className="max-w-md"
          />
        </div>

        <DataTable
          columns={columns}
          data={customers}
          getRowId={(row) => row.id as string}
          loading={isLoading}
          onRowClick={(row) => router.push(`/customers/${row.id}`)}
          emptyTitle="No customers found"
          emptyDescription={search ? "No customers match your search criteria." : "Get started by adding your first customer."}
        />

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleAddCustomer as any}
              onCancel={() => setIsAddOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
