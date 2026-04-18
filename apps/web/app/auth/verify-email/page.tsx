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
  const missingTokenMessage = "Missing verification token.";

  useEffect(() => {
    if (!token) {
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

  const effectiveStatus = token ? status : "error";
  const effectiveErrorMessage = token ? errorMessage : missingTokenMessage;

  return (
    <OtpVerification1
      status={effectiveStatus}
      title={effectiveStatus === "success" ? "Email Verified" : undefined}
      description={
        effectiveStatus === "success"
          ? "Your email has been verified successfully."
          : undefined
      }
      errorMessage={effectiveErrorMessage}
      primaryActionLabel={
        effectiveStatus === "loading"
          ? "Verifying..."
          : effectiveStatus === "success"
            ? "Go to Dashboard"
            : "Go to Sign In"
      }
      onPrimaryAction={() => {
        if (effectiveStatus === "loading") {
          return;
        }
        router.push(effectiveStatus === "success" ? "/" : "/auth/signin");
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
