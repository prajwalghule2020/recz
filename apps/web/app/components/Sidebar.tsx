"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Upload", icon: "📤" },
  { href: "/people", label: "People", icon: "👥" },
  { href: "/events", label: "Events", icon: "📅" },
  { href: "/places", label: "Places", icon: "📍" },
  { href: "/search", label: "Search", icon: "🔍" },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      <div className="sidebar-footer">
        <p className="sidebar-version">v0.2.0</p>
      </div>
    </nav>
  );
}
