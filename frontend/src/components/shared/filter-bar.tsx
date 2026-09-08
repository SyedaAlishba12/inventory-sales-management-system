import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function FilterBar({ children, className, hasActiveFilters = false, onReset }: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-center", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal className="size-4 text-primary" />
        Filters
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {onReset ? (
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!hasActiveFilters}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}
