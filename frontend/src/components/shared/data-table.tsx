"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

type SortDirection = "asc" | "desc";
type SortValue = string | number | Date | null | undefined;

export interface DataTableColumn<TRow> {
  id: string;
  header: ReactNode;
  accessor: keyof TRow | ((row: TRow) => ReactNode);
  sortable?: boolean;
  sortValue?: (row: TRow) => SortValue;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  getRowId: (row: TRow) => string | number;
  loading?: boolean;
  loadingRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: TRow) => void;
}

function renderCell<TRow>(row: TRow, column: DataTableColumn<TRow>) {
  if (typeof column.accessor === "function") return column.accessor(row);
  const value = row[column.accessor];
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function getSortValue<TRow>(row: TRow, column: DataTableColumn<TRow>): SortValue {
  if (column.sortValue) return column.sortValue(row);
  if (typeof column.accessor === "function") return null;
  const value = row[column.accessor];
  return value instanceof Date || typeof value === "string" || typeof value === "number" ? value : String(value ?? "");
}

function compareValues(left: SortValue, right: SortValue) {
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
}

export function DataTable<TRow>({
  columns,
  data,
  emptyDescription = "Try changing your search or filters.",
  emptyTitle = "No records found",
  getRowId,
  loading = false,
  loadingRows = 5,
  onRowClick,
}: DataTableProps<TRow>) {
  const [sort, setSort] = useState<{ columnId: string; direction: SortDirection } | null>(null);
  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column) return data;
    return [...data].sort((left, right) => {
      const result = compareValues(getSortValue(left, column), getSortValue(right, column));
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, data, sort]);

  function toggleSort(column: DataTableColumn<TRow>) {
    if (!column.sortable) return;
    setSort((current) =>
      current?.columnId === column.id
        ? { columnId: column.id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { columnId: column.id, direction: "asc" },
    );
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: TRow) {
    if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onRowClick(row);
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/70 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => {
                const activeSort = sort?.columnId === column.id ? sort.direction : null;
                const SortIcon = activeSort === "asc" ? ArrowUp : activeSort === "desc" ? ArrowDown : ChevronsUpDown;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={activeSort === "asc" ? "ascending" : activeSort === "desc" ? "descending" : "none"}
                    className={cn(
                      "whitespace-nowrap px-4 py-3",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.className,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                          column.align === "right" && "ml-auto",
                        )}
                        onClick={() => toggleSort(column)}
                      >
                        {column.header}
                        <SortIcon className="size-3.5" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: loadingRows }, (_, rowIndex) => (
                  <tr key={`loading-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-4">
                        <Skeleton className="h-5 w-full max-w-36" />
                      </td>
                    ))}
                  </tr>
                ))
              : sortedData.map((row) => (
                  <tr
                    key={getRowId(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(event) => handleRowKeyDown(event, row)}
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      onRowClick && "cursor-pointer outline-none focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-4 py-3 text-foreground",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right",
                          column.className,
                        )}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && data.length === 0 ? (
        <div className="border-t p-4">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : null}
    </div>
  );
}
