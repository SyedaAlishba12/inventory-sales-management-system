"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { SupplierForm } from "@/components/suppliers/supplier-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
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
import type {
  SupplierCreate,
  SupplierResponse,
} from "@/types/supplier";
import { toastUtils } from "@/utils/toast";

function SuppliersContent() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<SupplierResponse[]>(
        "/api/suppliers",
        {
          query: searchQuery
            ? { search: searchQuery }
            : undefined,
        },
      );
      setSuppliers(data);
    } catch (err) {
      toastUtils.error(err, "Error fetching suppliers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers(debouncedSearch);
  }, [debouncedSearch, fetchSuppliers]);

  const handleAddSupplier = async (data: SupplierCreate) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/api/suppliers", data);
      toastUtils.success("Supplier added successfully");
      setIsAddOpen(false);
      fetchSuppliers(debouncedSearch);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<SupplierResponse>[] = [
    {
      id: "name",
      header: "Company Name",
      accessor: "name",
      sortable: true,
    },
    {
      id: "contact",
      header: "Company",
      accessor: "company",
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
  ];

  return (
    <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">
              Suppliers
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage your supplier database.
            </p>
          </div>
        </div>

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search suppliers by name, email, or phone..."
          className="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        getRowId={(row) => row.id}
        loading={isLoading}
        onRowClick={(row) => router.push(`/suppliers/${row.id}`)}
        emptyTitle="No suppliers found"
        emptyDescription={
          search
            ? "No suppliers match your search criteria."
            : "Get started by adding your first supplier."
        }
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>

          <SupplierForm
            onSubmit={handleAddSupplier as any}
            onCancel={() => setIsAddOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <AuthGuard requireAdmin>
      <SuppliersContent />
    </AuthGuard>
  );
}
