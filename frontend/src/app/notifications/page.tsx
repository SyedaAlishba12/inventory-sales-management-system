"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/utils/api-client";

import { NotificationStats } from "@/components/notifications/notification-stats";

import { NotificationFilters } from "@/components/notifications/notification-filters";

import {
  Notification,
} from "@/components/notifications/notification-card";

import { NotificationList } from "@/components/notifications/notification-list";


export default function NotificationsPage() {
  const router = useRouter();

  const {
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedType, setSelectedType] =
    useState("ALL");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");


  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await apiClient.get<Notification[]>(
          "/api/notifications"
        );

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Notification fetch error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // AUTH CHECK + INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    fetchNotifications();
  }, [
    authLoading,
    isAuthenticated,
  ]);


  // ============================================================
  // MARK SINGLE AS READ
  // ============================================================

  const handleMarkRead = async (
    notificationId: string
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const updatedNotification =
        await apiClient.put<Notification>(
          `/api/notifications/${notificationId}/read`
        );

      setNotifications((current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? updatedNotification
              : notification
        )
      );

    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update notification."
      );

    } finally {
      setActionLoading(false);
    }
  };


  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      setError("");

      await apiClient.put(
        "/api/notifications/read-all"
      );

      setNotifications((current) =>
        current.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
      );

    } catch (err) {
      console.error(
        "Mark all notifications read error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update notifications."
      );

    } finally {
      setActionLoading(false);
    }
  };


  // ============================================================
  // FILTER NOTIFICATIONS
  // ============================================================

  const filteredNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) => {
          const typeMatches =
            selectedType === "ALL" ||
            notification.type ===
              selectedType;

          const statusMatches =
            selectedStatus === "ALL" ||
            (
              selectedStatus === "UNREAD" &&
              !notification.is_read
            ) ||
            (
              selectedStatus === "READ" &&
              notification.is_read
            );

          return (
            typeMatches &&
            statusMatches
          );
        }
      );
    }, [
      notifications,
      selectedType,
      selectedStatus,
    ]);


  // ============================================================
  // STATS
  // ============================================================

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const readNotifications =
    notifications.filter(
      (notification) =>
        notification.is_read
    ).length;

  const stockNotifications =
    notifications.filter(
      (notification) =>
        notification.type ===
          "LOW_STOCK" ||
        notification.type ===
          "MULTIPLE_LOW_STOCK"
    ).length;


  // ============================================================
  // AUTH LOADING
  // ============================================================

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">

            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#0F4C5C]" />

            <p className="mt-3 text-sm text-[#7A8B91]">
              Checking authentication...
            </p>

          </div>
        </div>
      </MainLayout>
    );
  }


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <MainLayout>

      <div className="space-y-6 p-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Bell className="h-6 w-6 text-[#0F4C5C]" />

              <h1 className="text-2xl font-bold text-[#0F4C5C]">
                Notifications
              </h1>

            </div>

            <p className="mt-1 text-sm text-[#7A8B91]">
              View and manage system alerts, stock warnings,
              sales, and purchase notifications.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Button
              type="button"
              variant="outline"
              onClick={
                fetchNotifications
              }
              disabled={
                loading ||
                authLoading ||
                !isAuthenticated
              }
              className="gap-2"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </Button>


            <Button
              type="button"
              onClick={
                handleMarkAllRead
              }
              disabled={
                actionLoading ||
                unreadNotifications === 0 ||
                !isAuthenticated
              }
              className="gap-2 bg-[#0F4C5C] hover:bg-[#0C3F4C]"
            >

              <CheckCheck className="h-4 w-4" />

              Mark All Read

            </Button>

          </div>
        </div>


        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* STATS */}

        <NotificationStats
          total={
            totalNotifications
          }
          unread={
            unreadNotifications
          }
          read={
            readNotifications
          }
          lowStock={
            stockNotifications
          }
        />


        {/* FILTERS */}

        <NotificationFilters
          selectedType={
            selectedType
          }
          selectedStatus={
            selectedStatus
          }
          onTypeChange={
            setSelectedType
          }
          onStatusChange={
            setSelectedStatus
          }
        />


        {/* NOTIFICATIONS */}

        <div>

          <div className="mb-3 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-[#44555B]">
                Notifications
              </h2>

              <p className="text-sm text-[#7A8B91]">
                Showing{" "}
                {filteredNotifications.length}{" "}
                of{" "}
                {totalNotifications}{" "}
                notifications
              </p>

            </div>

          </div>


          {loading ? (

            <div className="rounded-xl border border-[#D7E0E3] bg-white px-6 py-12 text-center shadow-sm">

              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#0F4C5C]" />

              <p className="mt-3 text-sm text-[#7A8B91]">
                Loading notifications...
              </p>

            </div>

          ) : (

            <NotificationList
              notifications={
                filteredNotifications
              }
              onMarkRead={
                handleMarkRead
              }
            />

          )}

        </div>

      </div>

    </MainLayout>
  );
}