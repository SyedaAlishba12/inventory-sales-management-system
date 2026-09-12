"use client";

/**
 * frontend/src/app/profile/page.tsx
 * -----------------------------------
 * Profile page — shows current user info from useAuth(), edit full_name,
 * and a change-password form.
 *
 * Protected by AuthGuard (login required, no admin requirement).
 *
 * Components: Button, Input, Label, Card*, Alert / AlertDescription,
 *             Spinner, Badge (for role display)
 */

import { type FormEvent, useState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/api-error-handler";

// ---------------------------------------------------------------------------
// Edit profile form
// ---------------------------------------------------------------------------

function EditProfileSection() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync if user object changes externally.
  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({ full_name: fullName.trim() });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile information</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {success && (
            <Alert variant="success" id="profile-success">
              <AlertDescription>Profile updated successfully.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" id="profile-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="cursor-not-allowed"
            />
            <p className="text-xs text-[#52646A]">Email address cannot be changed.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-full-name">Full name</Label>
            <Input
              id="profile-full-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!error}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="edit-profile-form"
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="size-4" /> : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Change password form
// ---------------------------------------------------------------------------

const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function ChangePasswordSection() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!PASSWORD_PATTERN.test(newPassword)) {
      setError(
        "New password must be at least 8 characters with an uppercase letter, a digit, and a special character.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Enter your current password to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="change-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {success && (
            <Alert variant="success" id="password-change-success">
              <AlertDescription>Password changed successfully.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" id="password-change-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

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
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="change-password-form"
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="size-4" /> : "Change password"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F4C5C]">My profile</h1>
            <p className="text-sm text-[#52646A]">{user?.email}</p>
          </div>
          <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
            {user?.role ?? "—"}
          </Badge>
        </div>

        <Separator />

        <EditProfileSection />
        <ChangePasswordSection />

        <Separator />

        <div className="flex justify-end">
          <Button variant="destructive" onClick={logout} id="logout-button">
            Sign out
          </Button>
        </div>
      </main>
    </AuthGuard>
  );
}
