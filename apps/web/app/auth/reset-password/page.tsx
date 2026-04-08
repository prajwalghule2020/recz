"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      toast.error("Invalid reset link.");
      return;
    }
    setLoading(true);
    await authClient.resetPassword(
      { newPassword: password, token },
      {
        onSuccess: () => {
          toast.success("Password reset successfully!");
          router.push("/auth/signin");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    setLoading(false);
  };

  if (!token) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[var(--text)]">
            Invalid Reset Link
          </CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Request a new link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[var(--text)]">
          Set new password
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password" className="text-[var(--text)]">
                New Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)]"
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="confirmPassword"
                className="text-[var(--text)]"
              >
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)]"
              />
            </Field>
            <Field>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-2))",
                }}
              >
                {loading && <Spinner className="mr-2 h-4 w-4" />}
                Reset Password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="flex items-center justify-center p-8">
            <Spinner className="h-6 w-6" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
