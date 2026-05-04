"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, initials, displayName } from "@/lib/utils/roles";

export function Navbar() {
  const { user, logout, status } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") return null;

  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-white text-base"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen size={14} className="text-white" />
          </div>
          BlogApp
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={15} />}>
            Dashboard
          </NavLink>
          <NavLink href="/profile" icon={<User size={15} />}>
            Profile
          </NavLink>
          {admin && (
            <NavLink href="/admin" icon={<Shield size={15} />}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Avatar + name */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 ring-1 ring-indigo-500/40 text-xs font-semibold text-indigo-300">
              {initials(user)}
            </div>
            <span className="text-sm text-slate-300 font-medium max-w-[120px] truncate">
              {displayName(user)}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/6"
          >
            <LogOut size={15} />
            {loggingOut ? "..." : "Logout"}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-1.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 bg-slate-950/95 px-4 pb-4 pt-2">
          <div className="flex items-center gap-2.5 py-3 border-b border-white/8 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 ring-1 ring-indigo-500/40 text-xs font-semibold text-indigo-300">
              {initials(user)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{displayName(user)}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>
            Profile
          </MobileNavLink>
          {admin && (
            <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>
              Admin Panel
            </MobileNavLink>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={15} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/6 transition-all"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors"
    >
      {children}
    </Link>
  );
}
