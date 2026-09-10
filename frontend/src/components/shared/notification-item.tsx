import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";

import type { NotificationSummary } from "@/types";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/date";

const notificationStyles = {
  info: { icon: Info, className: "bg-blue-100 text-blue-700" },
  success: { icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-700" },
  error: { icon: XCircle, className: "bg-red-100 text-red-700" },
};

interface NotificationItemProps {
  notification: NotificationSummary;
  onClick?: (notification: NotificationSummary) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const style = notificationStyles[notification.type] || { icon: Bell, className: "bg-muted text-foreground" };
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left outline-none transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
        !notification.isRead && "border-teal-200 bg-teal-50/50",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", style.className)}>
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="font-semibold text-foreground">{notification.title}</span>
          {!notification.isRead ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{notification.message}</span>
        <span className="mt-2 block text-xs text-muted-foreground">{formatRelativeDate(notification.createdAt)}</span>
      </span>
    </button>
  );
}
