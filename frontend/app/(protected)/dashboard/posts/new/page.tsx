"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CreatePostForm from "@/components/blog/CreatePostForm";
import { Loader2 } from "lucide-react";

export default function NewPostPage() {
  const { status } = useAuth();
  const router = useRouter();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/dashboard/posts/new");
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

  return (
    <div className="w-full min-h-full bg-white">
      {/* Narrow editorial column — identical to Medium's ~680px reading width */}
      <div
        className="mx-auto px-6 sm:px-10 py-14 sm:py-20"
        style={{ maxWidth: "740px" }}
      >
        <CreatePostForm />
      </div>
    </div>
  );
}