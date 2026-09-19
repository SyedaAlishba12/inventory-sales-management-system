"use client";

/**
 * frontend/src/app/login/page.tsx
 * ---------------------------------
 * Login page — email + password, shows API error verbatim on failure.
 *
 * Components: Button, Input, Label, Card*, Alert / AlertDescription, Spinner
 */

import { type FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/api-error-handler";

// ---------------------------------------------------------------------------
// Inner component — reads query params (safe inside Suspense)
// ---------------------------------------------------------------------------

function LoginForm() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7F8] p-4">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-[#52646A] hover:text-[#0F4C5C]">
          <ArrowLeft className="mr-2 size-4" />
          Back to home
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Inventra account.</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {justRegistered && (
              <Alert variant="success" id="registered-notice">
                <AlertDescription>Account created! Please sign in.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" id="login-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#0F4C5C] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8B91] hover:text-[#0F4C5C]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="size-4" /> : "Sign in"}
          </Button>
          <p className="text-sm text-[#52646A]">
            No account yet?{" "}
            <Link href="/signup" className="font-semibold text-[#0F4C5C] hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page — wraps LoginForm in Suspense because useSearchParams requires it.
// ---------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
