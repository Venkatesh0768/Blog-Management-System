"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api/auth.api";

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { } = useAuth(); // ensure provider is mounted

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Store in-memory immediately
    setAccessToken(token);

    // Fetch user profile with the new token then redirect
    userApi
      .getMe()
      .then(() => {
        router.replace("/dashboard");
      })
      .catch(() => {
        setAccessToken(null);
        router.replace("/login?error=oauth_failed");
      });
  }, [router, searchParams]);

  return (
    <div className="bg-auth min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Completing sign-in...</p>
      </div>
    </div>
  );
}

/**
 * OAuth2 callback handler.
 * The Spring Boot OAuth2 success handler redirects here with:
 * /oauth2/callback?token=<accessToken>
 *
 * We extract the token, store it in memory, load the user profile,
 * update auth state and redirect to the dashboard.
 */
export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={
      <div className="bg-auth min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
