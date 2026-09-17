import type { Identifier } from "./index";

export interface CustomerSummary {
  id: Identifier;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  totalSpending?: number;
  purchaseCount?: number;
}

export interface CustomerCreate {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface CustomerUpdate {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}
