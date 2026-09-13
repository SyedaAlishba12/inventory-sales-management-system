import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
}

export function StatCard({ description, icon: Icon, loading, title, trend, trendLabel, value }: StatCardProps) {
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="border-[#D7E0E3]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#7A8B91]">{title}</p>
            {loading ? <div className="mt-2 h-8 w-28 animate-pulse rounded bg-[#EAF0F2]" /> : <p className="mt-2 text-2xl font-bold tracking-tight text-[#0F4C5C]">{value}</p>}
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#78A394]/15 text-[#0F4C5C]">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        {trend !== undefined ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", trend > 0 && "text-[#52B788]", trend < 0 && "text-[#E67E72]", trend === 0 && "text-[#7A8B91]")}>
              <TrendIcon className="size-3.5" />
              {Math.abs(trend)}%
            </span>
            <span className="text-[#7A8B91]">{trendLabel || "from previous period"}</span>
          </div>
        ) : description ? (
          <p className="mt-4 text-xs text-[#7A8B91]">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}