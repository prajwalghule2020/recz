"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { href: "/", label: "Upload", icon: "📤" },
  { href: "/photos", label: "Photos", icon: "🖼️" },
  { href: "/people", label: "People", icon: "👥" },
  { href: "/events", label: "Events", icon: "📅" },
  { href: "/places", label: "Places", icon: "📍" },
  { href: "/search", label: "Search", icon: "🔍" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <span className="sidebar-logo-text">Face-AI</span>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── User Profile ────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        {isPending ? (
          <div className="flex items-center gap-2 px-2 py-1">
            <Skeleton className="h-8 w-8 rounded-full bg-[var(--surface-2)]" />
            <div className="sidebar-label flex flex-col gap-1">
              <Skeleton className="h-3 w-20 bg-[var(--surface-2)]" />
              <Skeleton className="h-2.5 w-16 bg-[var(--surface-2)]" />
            </div>
          </div>
        ) : session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
                <Avatar className="h-8 w-8 border border-[var(--border)]">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-[var(--surface-2)] text-xs text-[var(--text)]">
                    {session.user.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="sidebar-label flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-[var(--text)]">
                    {session.user.name}
                  </span>
                  <span className="truncate text-xs text-[var(--text-muted)]">
                    {session.user.email}
                  </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-56 border-[var(--border)] bg-[var(--surface)]"
            >
              <DropdownMenuItem
                disabled
                className="text-[var(--text-muted)]"
              >
                {session.user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem
                className="cursor-pointer text-[var(--error)] focus:text-[var(--error)]"
                onClick={async () => {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => router.push("/auth/signin"),
                    },
                  });
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </nav>
  );
}
