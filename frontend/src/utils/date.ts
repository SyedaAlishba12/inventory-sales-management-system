import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function toDate(value: string | number | Date) {
  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: string | number | Date, fallback = "—") {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy") : fallback;
}

export function formatDateTime(value: string | number | Date, fallback = "—") {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy, h:mm a") : fallback;
}

export function formatRelativeDate(value: string | number | Date, fallback = "—") {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : fallback;
}

export function toDateInputValue(value?: string | number | Date | null) {
  if (value === null || value === undefined) return "";
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}
