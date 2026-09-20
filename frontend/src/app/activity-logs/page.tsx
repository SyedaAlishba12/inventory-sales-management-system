"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  User,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type { ActivityLog, ActivityLogListResponse } from "@/types";

const PAGE_SIZE = 20;

const actionOptions = [
  { label: "CREATE", value: "CREATE" },
  { label: "UPDATE", value: "UPDATE" },
  { label: "DELETE", value: "DELETE" },
  { label: "SALE", value: "SALE_CREATED" },
  { label: "STOCK IN", value: "STOCK_IN" },
  { label: "STOCK OUT", value: "STOCK_OUT" },
  { label: "DAMAGED", value: "DAMAGED" },
  { label: "ADJUSTMENT", value: "ADJUSTMENT" },
];

const entityOptions = [
  { label: "Product", value: "product" },
  { label: "Inventory", value: "inventory" },
  { label: "Sale", value: "Sale" },
  { label: "Purchase", value: "purchase" },
  { label: "Customer", value: "customer" },
  { label: "Supplier", value: "supplier" },
  { label: "User", value: "user" },
  { label: "Invoice", value: "invoice" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEntity(entity: string) {
  return entity.charAt(0).toUpperCase() + entity.slice(1);
}

function actionBadgeClass(action: string) {
  const normalized = action.toUpperCase();

  if (
    normalized.includes("CREATE") ||
    normalized.includes("SALE") ||
    normalized.includes("STOCK_IN")
  ) {
    return "bg-[#52B788]/15 text-[#2F855A] ring-[#52B788]/20";
  }

  if (
    normalized.includes("DELETE") ||
    normalized.includes("DAMAGED")
  ) {
    return "bg-[#E67E72]/15 text-[#C0564A] ring-[#E67E72]/20";
  }

  if (
    normalized.includes("UPDATE") ||
    normalized.includes("ADJUSTMENT") ||
    normalized.includes("STOCK_OUT")
  ) {
    return "bg-[#70588C]/15 text-[#70588C] ring-[#70588C]/20";
  }

  return "bg-[#0F4C5C]/10 text-[#0F4C5C] ring-[#0F4C5C]/20";
}

function ActivityRow({ activity }: { activity: ActivityLog }) {
  return (
    <tr className="border-b border-[#E2E8F0] last:border-0">
      <td className="px-4 py-4 align-top">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C]">
            <User className="size-4" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1E293B]">
              {activity.user_name || "System"}
            </p>

            {activity.user_id ? (
              <p className="truncate text-xs text-[#64748B]">
                {activity.user_id}
              </p>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        <Badge className={actionBadgeClass(activity.action)}>
          {formatAction(activity.action)}
        </Badge>
      </td>

      <td className="px-4 py-4 align-top">
        {activity.entity_type ? (
          <div>
            <p className="text-sm font-medium text-[#1E293B]">
              {formatEntity(activity.entity_type)}
            </p>

            {activity.entity_id ? (
              <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#64748B]">
                {activity.entity_id}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-[#94A3B8]">—</span>
        )}
      </td>

      <td className="max-w-[360px] px-4 py-4 align-top">
        <p className="text-sm leading-6 text-[#52646A]">
          {activity.description || "No description provided."}
        </p>
      </td>

      <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-[#64748B]">
        {formatDateTime(activity.created_at)}
      </td>
    </tr>
  );
}

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get<ActivityLogListResponse>(
        "/api/activity-logs",
        {
          query: {
            page,
            page_size: PAGE_SIZE,
            action: action || undefined,
            entity_type: entityType || undefined,
            start_date: startDate
              ? new Date(`${startDate}T00:00:00`)
              : undefined,
            end_date: endDate
              ? new Date(`${endDate}T23:59:59`)
              : undefined,
          },
        },
      );

      setActivities(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (requestError) {
      setActivities([]);
      setTotal(0);
      setTotalPages(0);
      setError(
        getErrorMessage(
          requestError,
          "Unable to load activity logs.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [action, entityType, startDate, endDate, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadActivities();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadActivities]);

  function handleFilterChange(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setAction("");
    setEntityType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  const hasFilters =
    Boolean(action) ||
    Boolean(entityType) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Activity Log"
          description="Track important actions and changes across your inventory and sales system."
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Activity Log" },
          ]}
          actions={
            <Button
              variant="outline"
              onClick={() => void loadActivities()}
              disabled={loading}
              className="border-[#D7E0E3] bg-white text-[#0F4C5C] hover:bg-[#F3F6F8]"
            >
              <RefreshCw
                className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
          }
        />

        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader className="border-b border-[#E2E8F0]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#0F4C5C]">
                  <Filter className="size-5" aria-hidden="true" />
                  Filters
                </CardTitle>

                <p className="mt-1 text-sm text-[#64748B]">
                  Narrow the activity history by action, entity, or date.
                </p>
              </div>

              {hasFilters ? (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-fit text-[#70588C] hover:bg-[#70588C]/10 hover:text-[#70588C]"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="activity-action"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  Action
                </label>

                <select
                  id="activity-action"
                  value={action}
                  onChange={(event) =>
                    handleFilterChange(setAction, event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white px-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                >
                  <option value="">All actions</option>

                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-entity"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  Entity
                </label>

                <select
                  id="activity-entity"
                  value={entityType}
                  onChange={(event) =>
                    handleFilterChange(setEntityType, event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white px-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                >
                  <option value="">All entities</option>

                  {entityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-start-date"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  From
                </label>

                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    id="activity-start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      handleFilterChange(setStartDate, event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="activity-end-date"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  To
                </label>

                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    id="activity-end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) =>
                      handleFilterChange(setEndDate, event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader className="border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#0F4C5C]">
                  <Activity className="size-5" aria-hidden="true" />
                  Recent Activity
                </CardTitle>

                <p className="mt-1 text-sm text-[#64748B]">
                  {loading
                    ? "Loading activity..."
                    : `${total} ${
                        total === 1 ? "activity" : "activities"
                      } found`}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-[#64748B]">
                  <RefreshCw
                    className="size-5 animate-spin text-[#0F4C5C]"
                    aria-hidden="true"
                  />
                  Loading activity logs...
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#E67E72]/10 text-[#E67E72]">
                  <Activity className="size-6" aria-hidden="true" />
                </div>

                <h3 className="text-base font-semibold text-[#1E293B]">
                  Unable to load activity
                </h3>

                <p className="mt-1 max-w-md text-sm text-[#64748B]">
                  {error}
                </p>

                <Button
                  variant="outline"
                  onClick={() => void loadActivities()}
                  className="mt-4 border-[#D7E0E3]"
                >
                  Try again
                </Button>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C]">
                  <Activity className="size-6" aria-hidden="true" />
                </div>

                <h3 className="text-base font-semibold text-[#1E293B]">
                  No activity found
                </h3>

                <p className="mt-1 max-w-md text-sm text-[#64748B]">
                  There are no activity logs matching your current filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          User
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Action
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Entity
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Description
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Date & Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {activities.map((activity) => (
                        <ActivityRow
                          key={activity.id}
                          activity={activity}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#64748B]">
                    Page {page} of {totalPages || 1}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                      className="border-[#D7E0E3]"
                    >
                      <ChevronLeft
                        className="mr-1 size-4"
                        aria-hidden="true"
                      />
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        page >= totalPages ||
                        totalPages === 0 ||
                        loading
                      }
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="border-[#D7E0E3]"
                    >
                      Next
                      <ChevronRight
                        className="ml-1 size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
