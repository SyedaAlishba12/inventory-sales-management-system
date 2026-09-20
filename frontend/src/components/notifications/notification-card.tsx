"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CircleDollarSign,
  PackageCheck,
  PackageX,
} from "lucide-react";

export interface Notification {
  id: string;
  user_id?: string | null;
  product_id?: string | null;
  title: string;
  message: string;
  is_read: boolean;
  type:
    | "LOW_STOCK"
    | "MULTIPLE_LOW_STOCK"
    | "NEW_SALE"
    | "PURCHASE_RECEIVED";
  created_at: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const typeConfig = {
  LOW_STOCK: {
    icon: PackageX,
    label: "Low Stock",
    iconClass: "text-red-600",
    bgClass: "bg-red-50",
  },

  MULTIPLE_LOW_STOCK: {
    icon: AlertTriangle,
    label: "Multiple Low Stock",
    iconClass: "text-orange-600",
    bgClass: "bg-orange-50",
  },

  NEW_SALE: {
    icon: CircleDollarSign,
    label: "New Sale",
    iconClass: "text-green-600",
    bgClass: "bg-green-50",
  },

  PURCHASE_RECEIVED: {
    icon: PackageCheck,
    label: "Purchase Received",
    iconClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const config =
    typeConfig[notification.type] ?? {
      icon: Bell,
      label: "Notification",
      iconClass: "text-[#0F4C5C]",
      bgClass: "bg-[#EAF3F5]",
    };

  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        notification.is_read
          ? "border-[#D7E0E3] bg-white"
          : "border-[#B7D1D8] bg-[#F7FBFC]"
      }`}
    >
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}
        >
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-sm font-semibold ${
                    notification.is_read
                      ? "text-[#44555B]"
                      : "text-[#0F4C5C]"
                  }`}
                >
                  {notification.title}
                </h3>

                {!notification.is_read && (
                  <span className="rounded-full bg-[#0F4C5C] px-2 py-0.5 text-[10px] font-semibold text-white">
                    NEW
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-[#7A8B91]">
                {config.label}
              </p>
            </div>

            <span className="text-xs text-[#8A999E]">
              {formatDate(notification.created_at)}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#56676D]">
            {notification.message}
          </p>

          {!notification.is_read && (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4C5C] hover:underline"
            >
              <Check className="h-4 w-4" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}