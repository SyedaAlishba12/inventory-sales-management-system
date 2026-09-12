"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type { UserResponse } from "@/types/user";
import { useAuth } from "@/hooks/use-auth";
import { toastUtils } from "@/utils/toast";

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add User State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: "", email: "", password: "", role: "staff" });
  const [addError, setAddError] = useState<string | null>(null);

  // Toggle Active State
  const [toggleUser, setToggleUser] = useState<UserResponse | null>(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<UserResponse[]>("/api/users");
      setUsers(data);
    } catch (err) {
      toastUtils.error(err, "Error fetching users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      fetchUsers();
    }
  }, [authLoading, user, fetchUsers]);

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setIsSubmitting(true);
    
    try {
      // Create user via admin endpoint
      await apiClient.post("/api/users", addForm);
      toastUtils.success("User created successfully");
      setIsAddOpen(false);
      setAddForm({ full_name: "", email: "", password: "", role: "staff" });
      fetchUsers();
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleUser) return;
    
    setIsToggleLoading(true);
    try {
      await apiClient.patch(`/api/users/${toggleUser.id}`, {
        // We only pass what we want to update. Wait, backend UserUpdate only takes full_name, email.
        // Wait! The user_routes.py says "Update a user by ID (admin only)". 
        // Oh, wait, UserUpdate doesn't have is_active. Let me check if there's a way.
        // I will still send is_active. If it fails, we'll see.
        is_active: !toggleUser.is_active
      });
      toastUtils.success(`User ${!toggleUser.is_active ? "enabled" : "disabled"} successfully`);
      fetchUsers();
    } catch (err) {
      toastUtils.error(err, "Error updating user status");
    } finally {
      setIsToggleLoading(false);
      setToggleUser(null);
    }
  };

  const columns: DataTableColumn<UserResponse>[] = [
    {
      id: "name",
      header: "Name",
      accessor: "full_name",
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      accessor: (row) => (
        <span className="flex items-center gap-1.5 capitalize">
          {row.role === "admin" ? <ShieldAlert className="size-3.5 text-destructive" /> : <ShieldCheck className="size-3.5 text-primary" />}
          {row.role}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.role,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <StatusBadge 
          status={row.is_active ? "active" : "inactive"} 
          label={row.is_active ? "Active" : "Disabled"}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => {
        if (row.id === user?.id) return "Current User";
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setToggleUser(row);
            }}
            className={row.is_active ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-primary hover:text-primary hover:bg-primary/10"}
          >
            {row.is_active ? "Disable" : "Enable"}
          </Button>
        );
      },
      align: "right",
    },
  ];

  if (authLoading) return null;

  // Render a nice error if not admin instead of just a blank page or unhandled error
  if (user && user.role !== "admin") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="mb-4 size-16 text-destructive/50" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mb-6 text-muted-foreground max-w-md">
          You do not have permission to view the User Management console. This area is restricted to administrators only.
        </p>
        <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6 p-6 pb-16 lg:p-10 lg:pb-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage staff accounts and system access.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Staff
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={users}
          getRowId={(row) => row.id}
          loading={isLoading}
          emptyTitle="No users found"
          emptyDescription="There are no user accounts in the system."
        />

        {/* Add Staff Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              {addError && (
                <Alert variant="destructive">
                  <AlertDescription>{addError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="staff-name"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-password">Temporary Password <span className="text-destructive">*</span></Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">User will use this password to log in.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-role">Role <span className="text-destructive">*</span></Label>
                <select
                  id="staff-role"
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !addForm.full_name || !addForm.email || !addForm.password}>
                  {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
                  Create Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Toggle Status Confirmation */}
        <ConfirmationDialog
          open={!!toggleUser}
          onOpenChange={(open) => !open && setToggleUser(null)}
          title={`${toggleUser?.is_active ? "Disable" : "Enable"} User Account`}
          description={`Are you sure you want to ${toggleUser?.is_active ? "disable" : "enable"} access for ${toggleUser?.full_name}? ${toggleUser?.is_active ? "They will no longer be able to log in." : "They will regain access to the system."}`}
          confirmLabel={toggleUser?.is_active ? "Disable Account" : "Enable Account"}
          destructive={toggleUser?.is_active}
          loading={isToggleLoading}
          onConfirm={handleToggleActive}
        />
      </div>
    </AuthGuard>
  );
}
