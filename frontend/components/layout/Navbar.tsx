"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, Shield, User, X, PenLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, initials, displayName } from "@/lib/utils/roles";

export function Navbar() {
  const { user, logout, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  };

  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f9]/95 backdrop-blur-sm border-b border-[#c4c7c7]">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-sans font-bold text-base text-[#1b1c1c] tracking-tight hover:text-[#2a676b] transition-colors"
        >
          StoryStack
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>Stories</NavLink>
          {user && (
            <>
              <NavLink href="/dashboard" active={pathname === "/dashboard"}>Dashboard</NavLink>
              <NavLink href="/profile" active={pathname === "/profile"}>Profile</NavLink>
              {admin && (
                <NavLink href="/admin" active={pathname.startsWith("/admin")}>Admin</NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#2a676b] border-t-transparent animate-spin" />
          ) : user ? (
            <>
              <Link
                href="/dashboard/posts/new"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold font-sans bg-[#1b1c1c] text-white rounded hover:bg-black transition-colors"
              >
                <PenLine size={14} />
                Write
              </Link>

              {/* Avatar */}
              <div className="relative group">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efeded] border border-[#c4c7c7] text-xs font-semibold text-[#1b1c1c] hover:border-[#747878] transition-colors"
                  aria-label="Account menu"
                >
                  {initials(user)}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#ffffff] border border-[#c4c7c7] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-[#e9e8e7]">
                    <p className="text-sm font-semibold text-[#1b1c1c] truncate">{displayName(user)}</p>
                    <p className="text-xs text-[#747878] truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#444748] hover:bg-[#f5f3f3] hover:text-[#1b1c1c] transition-colors"
                  >
                    <User size={14} />
                    Account Settings
                  </Link>
                  {admin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#444748] hover:bg-[#f5f3f3] hover:text-[#1b1c1c] transition-colors"
                    >
                      <Shield size={14} />
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-[#e9e8e7]">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                    >
                      <LogOut size={14} />
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-[#444748] hover:text-[#1b1c1c] transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[#1b1c1c] text-white px-3 py-1.5 rounded hover:bg-black transition-colors"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#444748] hover:text-[#1b1c1c] p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#c4c7c7] bg-[#fbf9f9] pb-4 pt-2" style={{ padding: "8px 40px 16px" }}>
          {user && (
            <div className="flex items-center gap-3 py-3 border-b border-[#e9e8e7] mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efeded] border border-[#c4c7c7] text-xs font-semibold text-[#1b1c1c]">
                {initials(user)}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1b1c1c]">{displayName(user)}</p>
                <p className="text-xs text-[#747878]">{user.email}</p>
              </div>
            </div>
          )}

          <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>Stories</MobileNavLink>

          {user ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink href="/dashboard/posts/new" onClick={() => setMenuOpen(false)}>Write a Story</MobileNavLink>
              <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>Account Settings</MobileNavLink>
              {admin && (
                <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</MobileNavLink>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded transition-colors"
              >
                <LogOut size={14} />
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>Sign in</MobileNavLink>
              <MobileNavLink href="/register" onClick={() => setMenuOpen(false)}>Get started</MobileNavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
        active
          ? "text-[#1b1c1c] font-semibold"
          : "text-[#444748] hover:text-[#1b1c1c] hover:bg-[#efeded]"
      }`}
    >
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
      className="block px-3 py-2 text-sm text-[#444748] hover:text-[#1b1c1c] hover:bg-[#efeded] rounded transition-colors"
    >
      {children}
    </Link>
  );
}
