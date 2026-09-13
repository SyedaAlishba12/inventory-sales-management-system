import { Boxes } from "lucide-react";
import Link from "next/link";

import { cn } from "@/utils/cn";

interface AppLogoProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function AppLogo({ className, compact = false, href = "/" }: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-[#0F4C5C] outline-none focus-visible:ring-2 focus-visible:ring-[#78A394] focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#0F4C5C] text-white shadow-sm">
        <Boxes className="size-5" aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">Inventra</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7A8B91]">
            Business Control
          </span>
        </span>
      )}
    </Link>
  );
}