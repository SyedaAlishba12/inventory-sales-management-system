"use client";

import {
  Bell,
  CheckCircle,
  CircleAlert,
  Mail,
} from "lucide-react";

interface NotificationStatsProps {
  total: number;
  unread: number;
  read: number;
  lowStock: number;
}

export function NotificationStats({
  total,
  unread,
  read,
  lowStock,
}: NotificationStatsProps) {
  const stats = [
    {
      label: "Total Notifications",
      value: total,
      icon: Bell,
    },
    {
      label: "Unread",
      value: unread,
      icon: Mail,
    },
    {
      label: "Read",
      value: read,
      icon: CheckCircle,
    },
    {
      label: "Stock Alerts",
      value: lowStock,
      icon: CircleAlert,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-[#D7E0E3] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A8B91]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#0F4C5C]">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-lg bg-[#EAF3F5] p-3">
                <Icon className="h-5 w-5 text-[#0F4C5C]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}