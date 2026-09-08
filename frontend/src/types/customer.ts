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
