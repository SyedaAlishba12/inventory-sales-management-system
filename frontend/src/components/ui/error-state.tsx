import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function ErrorState({
  action,
  description = "Something went wrong. Please try again.",
  icon: Icon = AlertTriangle,
  title = "Unable to load data",
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-[#E67E72]/30 bg-[#E67E72]/10 px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#E67E72]/15 text-[#E67E72]">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#E67E72]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#E67E72]/90">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}