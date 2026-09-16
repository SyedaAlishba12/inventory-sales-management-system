"use client";

/**
 * frontend/src/app/reset-password/page.tsx
 * ------------------------------------------
 * Reset password — reads `token` from the URL query parameter, accepts
 * new password + confirm, submits to POST /api/auth/reset-password.
 *
 * Components: Button, Input, Label, Card*, Alert / AlertDescription, Spinner
 */

import { type FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";

const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid link</CardTitle>
            <CardDescription>
              This password-reset link is missing a token. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="text-sm font-medium text-[#0F4C5C] hover:underline">
              Request new reset link
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_PATTERN.test(newPassword)) {
      setError(
        "Password must be at least 8 characters with an uppercase letter, a digit, and a special character.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reset password. The link may have expired."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <Alert variant="success" id="reset-success">
              <AlertDescription>
                Password updated! Redirecting you to sign in…
              </AlertDescription>
            </Alert>
          ) : (
            <form
              id="reset-password-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {error && (
                <Alert variant="destructive" id="reset-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-invalid={!!error}
                />
                <p className="text-xs text-[#52646A]">
                  Min 8 characters, one uppercase, one digit, one special character.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-new-password">Confirm new password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={!!error}
                />
              </div>
            </form>
          )}
        </CardContent>

        {!success && (
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              form="reset-password-form"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="size-4" /> : "Set new password"}
            </Button>
            <Link href="/login" className="text-sm font-medium text-[#0F4C5C] hover:underline">
              ← Back to sign in
            </Link>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
