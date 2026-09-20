"use client";

import { BellOff } from "lucide-react";

import {
  Notification,
  NotificationCard,
} from "./notification-card";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-[#D7E0E3] bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3F5]">
          <BellOff className="h-6 w-6 text-[#0F4C5C]" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-[#44555B]">
          No notifications found
        </h3>

        <p className="mt-1 text-sm text-[#7A8B91]">
          You are all caught up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}