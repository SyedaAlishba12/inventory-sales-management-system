"use client";

/**
 * frontend/src/components/auth/auth-guard.tsx
 * ---------------------------------------------
 * Client-side route protection.
 *
 * No Next.js middleware exists on develop. This component redirects to
 * /login when `useAuth()` has no user once the initial loading completes.
 * Pages that require admin role pass `requireAdmin` — staff users are
 * redirected to the dashboard.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
  /** When true the user must have role "admin" or be redirected. */
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking authentication…" />
      </div>
    );
  }

  // While redirecting, don't flash the protected content.
  if (!user || (requireAdmin && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
