"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthCard, AuthHeader } from "@/components/layout/AuthCard";
import { authApi } from "@/lib/api/auth.api";
import { isAxiosError } from "axios";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }

    setEmailError(undefined);
    setApiError(null);
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      // Always show success — server never reveals whether the email exists
      setSuccess(
        "If an account exists with that email, you will receive a reset code shortly."
      );
    } catch {
      setApiError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard>
        <div className="text-center flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Mail size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Check your inbox</h1>
            <p className="mt-2 text-sm text-slate-400">{success}</p>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() =>
              router.push(
                `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
              )
            }
          >
            Enter reset code
          </Button>
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email and we'll send you a verification code"
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Alert variant="error" message={apiError} />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(undefined);
          }}
          error={emailError}
          disabled={loading}
          autoFocus
        />

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "Sending..." : "Send reset code"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
