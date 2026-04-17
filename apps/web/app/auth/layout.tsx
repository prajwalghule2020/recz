"use client";

import appLogo from "@public/logo.svg";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isModernAuthPage =
    pathname === "/auth/signin" || pathname === "/auth/signup" || pathname === "/auth/verify-email";
  const needsTopOffset = pathname === "/auth/signin" || pathname === "/auth/signup";

  return (
    <div
      className={`flex min-h-svh flex-col items-center gap-6 p-6 md:p-10 ${
        needsTopOffset ? "justify-start pt-24 md:pt-28" : "justify-center"
      } ${isModernAuthPage ? "bg-[#121212]" : "bg-(--bg)"}
      }`}>
      <div className="flex w-full max-w-sm flex-col gap-6">
        {!isModernAuthPage ? (
          <a href="/" className="flex items-center gap-2 self-center font-medium text-(--text)">
            <div className="flex size-10 items-center justify-center rounded-full bg-white p-1 shadow-sm">
              <Image src={appLogo} alt="Face-AI Logo" className="h-full w-full object-contain" priority />
            </div>
            <span className="text-lg font-bold tracking-tight">Face-AI</span>
          </a>
        ) : null}
        {children}
      </div>
    </div>
  );
}
