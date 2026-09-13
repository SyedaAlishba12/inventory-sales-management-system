import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[#7A8B91]">
        <li>
          <Link href="/dashboard" className="rounded-sm outline-none transition hover:text-[#0F4C5C] focus-visible:ring-2 focus-visible:ring-[#78A394]">
            <Home className="size-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              {item.href && !current ? (
                <Link href={item.href} className="rounded-sm outline-none transition hover:text-[#0F4C5C] focus-visible:ring-2 focus-visible:ring-[#78A394]">
                  {item.label}
                </Link>
              ) : (
                <span className={current ? "font-medium text-[#0F4C5C]" : undefined} aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}