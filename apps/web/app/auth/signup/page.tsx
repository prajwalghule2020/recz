"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { SignUp1 } from "@/components/ui/modern-stunning-sign-up";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);
    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => {
          toast.success("Account created! Please sign in.");
          router.push("/auth/signin");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          toast.error(ctx.error.message);
        },
      }
    );
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <SignUp1
      name={name}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      error={error}
      loading={loading}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
