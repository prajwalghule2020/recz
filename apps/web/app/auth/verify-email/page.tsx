"use client";

import { useEffect, useState, Suspense } from "react";
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
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    authClient
      .verifyEmail({ query: { token } })
      .then((res) => {
        if (res.error) {
          setStatus("error");
          toast.error(res.error.message || "Verification failed");
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-[var(--text-muted)]">
            Verifying your email…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[var(--error)]">
            Verification Failed
          </CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            The verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]"
            onClick={() => router.push("/auth/signin")}
          >
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[var(--success)]">
          Email Verified! ✓
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          Your email has been verified. You can now sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          style={{
            background:
              "linear-gradient(135deg, var(--accent), var(--accent-2))",
          }}
          onClick={() => router.push("/")}
        >
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
