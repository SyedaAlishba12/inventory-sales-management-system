"use client";

import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({ className, onChange, onClear, placeholder = "Search...", value, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7A8B91]" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-[#D7E0E3] pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}