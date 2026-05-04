"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthCard, AuthHeader } from "@/components/layout/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    setLoading(true);

    try {
      await login({ email: form.email.trim(), password: form.password });
      router.push(redirect);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403) {
          setApiError("Please verify your email before logging in.");
          return;
        }
        setApiError(
          err.response?.data?.message ?? "Invalid email or password."
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Alert variant="error" message={apiError} />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          disabled={loading}
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          disabled={loading}
        />

        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {/* OAuth2 divider */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/8" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-transparent px-3 text-xs text-slate-500">
              or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/oauth2/authorization/google`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </a>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthCard>
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </AuthCard>
    }>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37.1 9.6C33.7 6.5 29.1 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c10.6 0 19.5-7.7 19.5-19.5 0-1.3-.1-2.6-.3-3.9-.2-.7-.9-1.6-1.6-2.1z"/>
      <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.5 16.4 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9L37.1 9.6C33.7 6.5 29.1 4.5 24 4.5c-7.4 0-13.7 4.1-17.1 10.2-.1 0-.3.3-.6.5z"/>
      <path fill="#4CAF50" d="M24 45.5c5 0 9.5-1.9 12.9-5l-6-4.7C29.1 37.4 26.7 38 24 38c-5.2 0-9.6-3.2-11.2-7.8l-6.5 5C9.9 41.5 16.5 45.5 24 45.5z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6 4.7c3.5-3.2 5.8-8 5.8-13.2 0-1.3-.1-2.6-.4-4z"/>
    </svg>
  );
}
