"use client";

import { useEffect, useState } from "react";
import { Check, User, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { apiClient } from "@/utils/api-client";
import type { Identifier } from "@/types";

// TODO: confirm the exact shape of Taha's GET /api/customers response and
// adjust the field names below if they differ (this assumes REST
// conventions matching our own /api/pos/products endpoint: a `search`
// query param returning a plain array). Wrapped in try/catch so a wrong
// guess just shows no results instead of crashing the POS screen.
interface CustomerOption {
  id: Identifier;
  name: string;
  phone?: string;
}

interface CustomerPickerProps {
  selectedCustomer: CustomerOption | null;
  onSelect: (customer: CustomerOption | null) => void;
}

export function CustomerPicker({ selectedCustomer, onSelect }: CustomerPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    apiClient
      .get<CustomerOption[]>("/api/customers", {
        query: { search: trimmed, limit: 5 },
        signal: controller.signal,
      })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          {selectedCustomer.name}
          {selectedCustomer.phone && (
            <span className="text-muted-foreground">· {selectedCustomer.phone}</span>
          )}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="h-7 px-2">
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        placeholder="Search customer by name or phone (optional — leave blank for walk-in)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim() && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-md">
          {loading && <p className="p-3 text-xs text-muted-foreground">Searching...</p>}
          {!loading && results.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">No customer found — will be a walk-in sale.</p>
          )}
          {!loading &&
            results.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  onSelect(customer);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <User className="size-3.5 text-muted-foreground" />
                {customer.name}
                {customer.phone && <span className="text-muted-foreground">· {customer.phone}</span>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
