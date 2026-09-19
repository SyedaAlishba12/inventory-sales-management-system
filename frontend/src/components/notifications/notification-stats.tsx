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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-lg border border-[#D7E0E3] bg-white px-4 py-3 shadow-sm"
          >

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <p className="truncate text-xs font-medium text-[#7A8B91]">
                  {stat.label}
                </p>

                <p className="mt-1 text-xl font-bold text-[#0F4C5C]">
                  {stat.value}
                </p>

              </div>


              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF3F5]">

                <Icon className="h-4 w-4 text-[#0F4C5C]" />

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}