"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api/auth.api";
import { isAxiosError } from "axios";
import { LogOut, Lock, User, Loader2 } from "lucide-react";
import { initials } from "@/lib/utils/roles";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, status, refreshUser, logout } = useAuth();
  const router = useRouter();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/profile");
    }
  }, [status, router]);

  // ── Loading state during auth check ──────────────────────────────────────────
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2a676b]" />
      </div>
    );
  }

  // ── Profile ──────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  });
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.firstName.trim() || !profile.lastName.trim()) return;
    setProfileSuccess(null);
    setProfileError(null);
    setProfileLoading(true);
    try {
      await userApi.updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
      });
      await refreshUser();
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      if (isAxiosError(err)) {
        setProfileError(err.response?.data?.message ?? "Failed to update profile.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwErrors, setPwErrors] = useState<Partial<typeof pwForm>>({});
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<typeof pwForm> = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Required";
    if (!pwForm.newPassword) errs.newPassword = "Required";
    else if (pwForm.newPassword.length < 8) errs.newPassword = "Min. 8 characters";
    if (pwForm.newPassword !== pwForm.confirm) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwSuccess(null);
    setPwError(null);
    setPwLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      await logout();
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err)) {
        setPwError(err.response?.data?.message ?? "Failed to change password.");
      }
    } finally {
      setPwLoading(false);
    }
  };

  // ── Sessions ──────────────────────────────────────────────────────────────
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleLogoutAll = async () => {
    if (!confirm("This will sign you out of all devices. Continue?")) return;
    setSessionLoading(true);
    try {
      await userApi.logoutAllDevices();
      await logout();
      router.push("/login");
    } catch {
      await logout();
      router.push("/login");
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 sm:px-8 py-10 flex flex-col gap-8 fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-[#e9e8e7]">
        <p className="label-caps text-[#2a676b] mb-2">Account</p>
        <h1 className="text-3xl font-bold text-[#1b1c1c] font-sans tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#747878] font-sans mt-1">
          Manage your profile and security preferences.
        </p>
      </div>

      {/* ── Profile ── */}
      <section className="story-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center bg-[#efeded] border border-[#c4c7c7] rounded text-[#444748]">
            <User size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-[#1b1c1c] font-sans">Profile</h2>
            <p className="text-xs text-[#747878] font-sans">Update your display name</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e9e8e7]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efeded] border border-[#c4c7c7] text-xl font-bold text-[#1b1c1c] font-sans">
            {initials(user)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1b1c1c] font-sans">{user?.email}</p>
            <p className="text-xs text-[#747878] font-sans capitalize mt-0.5">
              {user?.provider} account
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
          <Alert variant="success" message={profileSuccess} />
          <Alert variant="error" message={profileError} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              disabled={profileLoading}
            />
            <Input
              label="Last name"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              disabled={profileLoading}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={profileLoading} size="sm">
              Save changes
            </Button>
          </div>
        </form>
      </section>

      {/* ── Security ── */}
      <section className="story-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center bg-[#efeded] border border-[#c4c7c7] rounded text-[#444748]">
            <Lock size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-[#1b1c1c] font-sans">Security</h2>
            <p className="text-xs text-[#747878] font-sans">Change your password</p>
          </div>
        </div>

        {user?.provider !== "local" ? (
          <p className="text-sm text-[#444748] font-sans bg-[#f5f3f3] border border-[#c4c7c7] rounded px-4 py-3">
            You signed in with{" "}
            <span className="font-semibold text-[#1b1c1c] capitalize">{user?.provider}</span>.
            Password management is handled by your OAuth provider.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <Alert variant="success" message={pwSuccess} />
            <Alert variant="error" message={pwError} />

            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              error={pwErrors.currentPassword}
              disabled={pwLoading}
            />
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              error={pwErrors.newPassword}
              disabled={pwLoading}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat new password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              error={pwErrors.confirm}
              disabled={pwLoading}
            />
            <Alert
              variant="warning"
              message="Changing your password will sign you out of all devices."
            />
            <div className="flex justify-end">
              <Button type="submit" loading={pwLoading} variant="danger" size="sm">
                Change password
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ── Sessions ── */}
      <section className="story-card border-[#ba1a1a]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center bg-[#ffdad6]/40 border border-[#ba1a1a]/20 rounded text-[#ba1a1a]">
            <LogOut size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-[#1b1c1c] font-sans">Sessions</h2>
            <p className="text-xs text-[#747878] font-sans">Revoke all active sessions</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-[#444748] font-sans leading-relaxed">
          Sign out from all devices — including this one. You will need to sign in again.
        </p>
        <Button variant="danger" onClick={handleLogoutAll} loading={sessionLoading} size="sm">
          <LogOut size={14} />
          Sign out all devices
        </Button>
      </section>
    </div>
  );
}
