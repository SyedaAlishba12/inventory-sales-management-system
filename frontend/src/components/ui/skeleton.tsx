import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-secondary", className)} {...props} />;
}
