"use client";

import { useState } from "react";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset(
      { email, redirectTo: "/auth/reset-password" },
      {
        onSuccess: () => {
          setSent(true);
          toast.success("Password reset email sent!");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    setLoading(false);
  };

  if (sent) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[var(--text)]">
            Check your email
          </CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            If an account exists for{" "}
            <span className="font-medium text-[var(--accent)]">{email}</span>,
            we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]"
            onClick={() => setSent(false)}
          >
            Try another email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[var(--text)]">
          Forgot your password?
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="text-[var(--text)]">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                Send Reset Link
              </Button>
              <FieldDescription className="text-center text-[var(--text-muted)]">
                Remember your password?{" "}
                <a
                  href="/auth/signin"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  Sign in
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
