"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { OtpVerification1 } from "@/components/ui/modern-stunning-otp-verification";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    authClient
      .verifyEmail({ query: { token } })
      .then((res) => {
        if (res.error) {
          setStatus("error");
          const message = res.error.message || "Verification failed";
          setErrorMessage(message);
          toast.error(message);
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Something went wrong while verifying your email.");
      });
  }, [token]);

  return (
    <OtpVerification1
      status={status}
      title={status === "success" ? "Email Verified" : undefined}
      description={
        status === "success"
          ? "Your email has been verified successfully."
          : undefined
      }
      errorMessage={errorMessage}
      primaryActionLabel={
        status === "loading"
          ? "Verifying..."
          : status === "success"
            ? "Go to Dashboard"
            : "Go to Sign In"
      }
      onPrimaryAction={() => {
        if (status === "loading") {
          return;
        }
        router.push(status === "success" ? "/" : "/auth/signin");
      }}
    />
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<OtpVerification1 status="loading" primaryActionLabel="Verifying..." onPrimaryAction={() => {}} />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
