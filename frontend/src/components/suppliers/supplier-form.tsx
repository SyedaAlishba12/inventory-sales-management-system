"use client";

import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { SupplierCreate, SupplierUpdate, SupplierResponse } from "@/types/supplier";
import { getErrorMessage } from "@/utils/api-error-handler";

interface SupplierFormProps {
  initialData?: SupplierResponse;
  onSubmit: (data: SupplierCreate | SupplierUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierForm({ initialData, onSubmit, onCancel, isLoading = false }: SupplierFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [contactPerson, setContactPerson] = useState(initialData?.contact_person ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({
        name,
        contact_person: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supplier-name">Company Name <span className="text-destructive">*</span></Label>
        <Input
          id="supplier-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-invalid={!!error}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supplier-contact">Contact Person</Label>
        <Input
          id="supplier-contact"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supplier-email">Email</Label>
        <Input
          id="supplier-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supplier-phone">Phone</Label>
        <Input
          id="supplier-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1-800-555-0100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supplier-address">Address</Label>
        <Input
          id="supplier-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? <Spinner className="size-4 mr-2" /> : null}
          {initialData ? "Save changes" : "Add supplier"}
        </Button>
      </div>
    </form>
  );
}
