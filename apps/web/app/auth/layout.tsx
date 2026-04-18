"use client";

import Footer from "@/components/shared/footer/Footer";
import SharedNavbar from "@/components/shared/navbar/Navbar";
import appLogo from "@public/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showPublicChrome = pathname === "/auth/signin" || pathname === "/auth/signup";
  const isModernAuthPage =
    showPublicChrome || pathname === "/auth/verify-email";
  const needsTopOffset = showPublicChrome;

  const content = (
    <div
      className={`flex min-h-svh flex-col items-center gap-6 p-6 md:p-10 ${
        needsTopOffset ? "justify-start pt-24 md:pt-28" : "justify-center"
      } ${isModernAuthPage ? "bg-[#121212]" : "bg-(--bg)"}`}>
      <div className="flex w-full max-w-sm flex-col gap-6">
        {!isModernAuthPage ? (
          <Link href="/" className="flex items-center gap-2 self-center font-medium text-(--text)">
            <div className="flex size-10 items-center justify-center rounded-full bg-white p-1 shadow-sm">
              <Image src={appLogo} alt="Face-AI Logo" className="h-full w-full object-contain" priority />
            </div>
            <span className="text-lg font-bold tracking-tight">Face-AI</span>
          </Link>
        ) : null}
        {children}
      </div>
    </div>
  );

  if (showPublicChrome) {
    return (
      <>
        <SharedNavbar />
        {content}
        <Footer />
      </>
    );
  }

  return content;
}
