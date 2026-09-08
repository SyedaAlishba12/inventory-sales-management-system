import { Badge, type BadgeProps } from "@/components/ui/badge";
import { humanize } from "@/utils/format";

const statusVariants: Record<string, BadgeProps["variant"]> = {
  active: "success",
  completed: "success",
  paid: "success",
  available: "success",
  pending: "warning",
  partial: "warning",
  low_stock: "warning",
  inactive: "secondary",
  draft: "secondary",
  cancelled: "destructive",
  failed: "destructive",
  overdue: "destructive",
  out_of_stock: "destructive",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return <Badge variant={statusVariants[normalized] || "outline"}>{label || humanize(status)}</Badge>;
}
