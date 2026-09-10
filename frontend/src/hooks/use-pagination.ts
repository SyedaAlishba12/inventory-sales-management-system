"use client";

import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/constants";

export function usePagination(totalItems: number, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return useMemo(() => {
    const safePage = Math.min(page, totalPages);
    return {
      page: safePage,
      pageSize,
      totalPages,
      offset: (safePage - 1) * pageSize,
      canGoPrevious: safePage > 1,
      canGoNext: safePage < totalPages,
      setPage(nextPage: number) {
        setPageState(Math.min(Math.max(1, nextPage), totalPages));
      },
      setPageSize(nextPageSize: number) {
        setPageSizeState(Math.max(1, nextPageSize));
        setPageState(1);
      },
    };
  }, [page, pageSize, totalPages]);
}
