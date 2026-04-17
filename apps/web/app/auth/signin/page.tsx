"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);
    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Signed in successfully!");
          router.push("/");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
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
    <SignIn1
      email={email}
      password={password}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSignIn={handleEmailSignIn}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
