"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/utils/api-client";

import { NotificationStats } from "@/components/notifications/notification-stats";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { Notification } from "@/components/notifications/notification-card";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const data = await apiClient.get<Notification[]>(
        "/api/notifications/"
      );

      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
    }
  }, [authLoading, user]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const data = await apiClient.get<Notification[]>(
        "/api/notifications/"
      );

      setNotifications(data);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      const updatedNotification =
        await apiClient.put<Notification>(
          `/api/notifications/${notificationId}/read`
        );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? updatedNotification
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put("/api/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const typeMatch =
        selectedType === "ALL" ||
        notification.type === selectedType;

      const statusMatch =
        selectedStatus === "ALL" ||
        (selectedStatus === "UNREAD" && !notification.is_read) ||
        (selectedStatus === "READ" && notification.is_read);

      return typeMatch && statusMatch;
    });
  }, [notifications, selectedType, selectedStatus]);

  const totalNotifications = notifications.length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const readNotifications = notifications.filter(
    (notification) => notification.is_read
  ).length;

  const lowStockNotifications = notifications.filter(
    (notification) =>
      notification.type === "LOW_STOCK" ||
      notification.type === "MULTIPLE_LOW_STOCK"
  ).length;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFB]">
        <div className="text-sm text-[#7A8B91]">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#0F4C5C] transition hover:text-[#083A47]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Page Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#0F4C5C]" />

              <h1 className="text-2xl font-bold text-[#0F4C5C]">
                Notifications
              </h1>
            </div>

            <p className="mt-1 text-sm text-[#7A8B91]">
              Stay updated with stock alerts, sales, and purchase
              activities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-[#D7E0E3] text-[#0F4C5C] hover:bg-[#EAF3F5]"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            {unreadNotifications > 0 && (
              <Button
                type="button"
                onClick={handleMarkAllRead}
                className="bg-[#0F4C5C] text-white hover:bg-[#083A47]"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <NotificationStats
          total={totalNotifications}
          unread={unreadNotifications}
          read={readNotifications}
          lowStock={lowStockNotifications}
        />

        {/* Filters */}
        <div className="mt-5">
          <NotificationFilters
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Notifications Box */}
        <div className="mt-5 rounded-xl border border-[#D7E0E3] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#44555B]">
              Your Notifications
            </h2>

            <span className="text-xs text-[#7A8B91]">
              {filteredNotifications.length} notification
              {filteredNotifications.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Only notifications area scrolls */}
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#7A8B91]">
                Loading notifications...
              </div>
            ) : (
              <NotificationList
                notifications={filteredNotifications}
                onMarkRead={handleMarkRead}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}