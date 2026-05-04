"use client";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, displayName, initials, roleBadgeClass, roleLabel } from "@/lib/utils/roles";
import { Shield, User, Clock, Mail, CheckCircle2, Calendar } from "lucide-react";
import Link from "next/link";
import type { RoleType } from "@/types/auth.types";

export default function DashboardPage() {
  const { user, status } = useAuth();

  if (status === "loading") return <LoadingState />;

  const admin = isAdmin(user);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Welcome */}
        <div className="fade-in mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back,{" "}
            <span className="text-indigo-400">{user?.firstName}</span> 👋
          </h1>
          <p className="mt-1.5 text-slate-400">
            Here&apos;s a summary of your account.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 fade-in">
          {/* Profile card */}
          <div className="glass-card p-6 sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/25 ring-1 ring-indigo-500/40 text-2xl font-bold text-indigo-300">
                {initials(user)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {displayName(user)}
                </h2>
                <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user?.roles.map((r) => (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(r as RoleType)}`}
                    >
                      {r === "ROLE_ADMIN" && <Shield size={10} />}
                      {roleLabel(r as RoleType)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/8 pt-5 text-sm">
              <InfoRow icon={<Mail size={14} />} label="Email" value={user?.email ?? ""} />
              <InfoRow
                icon={<CheckCircle2 size={14} />}
                label="Email verified"
                value={user?.emailVerified ? "Yes" : "No"}
              />
              <InfoRow
                icon={<User size={14} />}
                label="Sign-in method"
                value={
                  user?.provider === "local"
                    ? "Email & Password"
                    : user?.provider ?? "—"
                }
              />
              <InfoRow
                icon={<Clock size={14} />}
                label="Last login"
                value={
                  user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : "—"
                }
              />
              <InfoRow
                icon={<Calendar size={14} />}
                label="Member since"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-4">
            <QuickAction
              href="/profile"
              icon={<User size={20} />}
              title="Edit Profile"
              desc="Update your name and avatar"
              color="indigo"
            />
            {admin && (
              <QuickAction
                href="/admin"
                icon={<Shield size={20} />}
                title="Admin Panel"
                desc="Manage users and roles"
                color="rose"
              />
            )}
            <QuickAction
              href="/profile#security"
              icon={<CheckCircle2 size={20} />}
              title="Security"
              desc="Change password, manage sessions"
              color="emerald"
            />
          </div>
        </div>

        {/* Security notice */}
        {!user?.emailVerified && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-300 fade-in">
            ⚠️ Your email is not verified.{" "}
            <Link
              href={`/verify-otp?email=${encodeURIComponent(user?.email ?? "")}`}
              className="underline font-medium"
            >
              Verify now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "indigo" | "rose" | "emerald";
}) {
  const colorMap = {
    indigo: "bg-indigo-600/15 text-indigo-400 group-hover:bg-indigo-600/25",
    rose: "bg-rose-600/15 text-rose-400 group-hover:bg-rose-600/25",
    emerald: "bg-emerald-600/15 text-emerald-400 group-hover:bg-emerald-600/25",
  };
  return (
    <Link
      href={href}
      className="glass-card group flex items-center gap-3 p-4 transition-all hover:border-white/15"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );
}
