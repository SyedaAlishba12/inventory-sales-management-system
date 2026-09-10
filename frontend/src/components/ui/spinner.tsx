import { LoaderCircle } from "lucide-react";

import { cn } from "@/utils/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <LoaderCircle className={cn("size-5 animate-spin text-primary", className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
