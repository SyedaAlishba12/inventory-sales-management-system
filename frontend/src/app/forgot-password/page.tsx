"use client";

/**
 * frontend/src/app/forgot-password/page.tsx
 * -------------------------------------------
 * Forgot password — submits email, always shows a generic "if that email
 * exists, a reset link was sent" message. This matches the backend's own
 * behaviour and avoids leaking whether an email is registered.
 *
 * Components: Button, Input, Label, Card*, Alert / AlertDescription, Spinner
 */

import { type FormEvent, useState } from "react";
import Link from "next/link";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", { email });
    } catch {
      // Intentionally suppress errors — we always show the generic message
      // so that the response cannot be used to enumerate registered emails.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send a reset link if an account exists.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <Alert variant="success" id="forgot-password-success">
              <AlertDescription>
                If that email address is registered, you&apos;ll receive a reset link shortly.
                Check your inbox (and spam folder).
              </AlertDescription>
            </Alert>
          ) : (
            <form
              id="forgot-password-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {!submitted && (
            <Button
              type="submit"
              form="forgot-password-form"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="size-4" /> : "Send reset link"}
            </Button>
          )}
          <Link href="/login" className="text-sm font-medium text-[#0F4C5C] hover:underline">
            ← Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
