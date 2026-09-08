import type { PaymentMethod } from "@/types";

export const APP_NAME = "Inventra";
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const API_TIMEOUT_MS = 15_000;

export const PAYMENT_METHODS: ReadonlyArray<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  { value: "cash", label: "Cash", description: "Receive cash at checkout" },
  { value: "card", label: "Card", description: "Process a card payment" },
  { value: "online", label: "Online", description: "Record an online payment" },
];
