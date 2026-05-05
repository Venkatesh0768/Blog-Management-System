"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  Settings,
  PenLine,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-16 left-0 border-r border-gray-200 bg-white">
      
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <Link href="/" className="block">
          <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
            StoryStack
          </h2>
        </Link>
      </div>

      {/* Write CTA */}
      <div className="px-4 py-5">
        <Link
          href="/dashboard/posts/new"
          className="flex items-center justify-center gap-2 w-full bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
        >
          <PenLine size={16} />
          Write
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <SidebarLink
          href="/dashboard/posts"
          icon={<Library size={18} />}
          label="Library"
          active={isActive("/dashboard/posts")}
        />
        <SidebarLink
          href="/profile"
          icon={<Settings size={18} />}
          label="Settings"
          active={isActive("/profile")}
        />
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
        active
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {/* Active Indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-black rounded-r-full" />
      )}

      <span
        className={`transition-colors ${
          active ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}