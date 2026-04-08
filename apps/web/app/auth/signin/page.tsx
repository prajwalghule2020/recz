"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Signed in successfully!");
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          if (ctx.error.status === 403) {
            toast.info("Please verify your email first.");
          }
        },
      }
    );
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[var(--text)]">
          Welcome back
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Sign in to your Face-AI account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignIn}>
          <FieldGroup>
            <Field>
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-5 w-5"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </Field>
            <FieldSeparator className="text-[var(--text-muted)]">
              Or continue with email
            </FieldSeparator>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="text-[var(--text)]"
              >
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
              <div className="flex items-center">
                <FieldLabel
                  htmlFor="password"
                  className="text-[var(--text)]"
                >
                  Password
                </FieldLabel>
                <a
                  href="/auth/forgot-password"
                  className="ml-auto text-sm text-[var(--text-muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Sign In
              </Button>
              <FieldDescription className="text-center text-[var(--text-muted)]">
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/signup"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  Sign up
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
