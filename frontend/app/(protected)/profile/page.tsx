"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api/auth.api";
import { isAxiosError } from "axios";
import { LogOut, Lock, User } from "lucide-react";
import { initials } from "@/lib/utils/roles";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();

  // ── Profile section ──────────────────────────────────────────────────────
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

  // ── Password section ─────────────────────────────────────────────────────
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
      // All sessions revoked — force logout
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

  // ── Sessions section ──────────────────────────────────────────────────────
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleLogoutAll = async () => {
    if (!confirm("This will log you out of all devices. Continue?")) return;
    setSessionLoading(true);
    try {
      await userApi.logoutAllDevices();
      await logout();
      router.push("/login");
    } catch {
      // still redirect
      await logout();
      router.push("/login");
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 flex flex-col gap-6 fade-in">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>

        {/* ── Profile ── */}
        <section id="profile" className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Profile</h2>
              <p className="text-xs text-slate-500">Update your display name</p>
            </div>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/25 ring-1 ring-indigo-500/40 text-xl font-bold text-indigo-300">
              {initials(user)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.provider} account</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <Alert variant="success" message={profileSuccess} />
            <Alert variant="error" message={profileError} />

            <div className="grid grid-cols-2 gap-3">
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

            <Button type="submit" loading={profileLoading} className="self-end">
              Save changes
            </Button>
          </form>
        </section>

        {/* ── Security ── */}
        <section id="security" className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Security</h2>
              <p className="text-xs text-slate-500">Change your password</p>
            </div>
          </div>

          {user?.provider !== "local" ? (
            <p className="text-sm text-slate-400 bg-white/4 rounded-xl p-3">
              You signed in with{" "}
              <span className="font-medium text-white capitalize">{user?.provider}</span>.
              Password management is handled by your OAuth provider.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
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
                message="Changing your password will log you out of all devices."
              />
              <Button type="submit" loading={pwLoading} variant="danger" className="self-end">
                Change password
              </Button>
            </form>
          )}
        </section>

        {/* ── Sessions ── */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/20 text-rose-400">
              <LogOut size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Sessions</h2>
              <p className="text-xs text-slate-500">Revoke all active sessions</p>
            </div>
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Sign out from all devices — including this one. You will need to log in again.
          </p>
          <Button
            variant="danger"
            onClick={handleLogoutAll}
            loading={sessionLoading}
          >
            <LogOut size={15} />
            Logout from all devices
          </Button>
        </section>
      </div>
    </div>
  );
}
