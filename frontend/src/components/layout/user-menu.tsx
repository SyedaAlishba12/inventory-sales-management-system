"use client";

import { LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({
  avatarUrl,
  email = "admin@inventra.app",
  name = "Admin User",
  onLogout,
  role = "Administrator",
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 text-left outline-none transition hover:bg-[#EAF0F2] focus-visible:ring-2 focus-visible:ring-[#78A394]"
          aria-label="Open user menu"
        >
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback className="bg-[#0F4C5C] text-white">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-36 truncate text-sm font-semibold text-[#0F4C5C]">{name}</span>
            <span className="block text-xs text-[#7A8B91]">{role}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate text-sm text-[#0F4C5C]">{name}</span>
          <span className="mt-0.5 block truncate font-normal text-[#7A8B91]">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">
            <UserRound className="size-4" />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings className="size-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[#E67E72] focus:bg-[#E67E72]/10 focus:text-[#E67E72]" onSelect={onLogout}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}