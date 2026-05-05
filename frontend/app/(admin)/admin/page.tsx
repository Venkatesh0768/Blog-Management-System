"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { UserTable } from "@/components/admin/UserTable";
import { AdminPostTable } from "@/components/admin/AdminPostTable";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { adminApi, PageResponse } from "@/lib/api/admin.api";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { Shield, Users, RefreshCw, FileText } from "lucide-react";
import { User } from "@/types/auth.types";
import { PostResponseDto, Page } from "@/types/blog.types";

type Tab = "users" | "posts";

export default function AdminDashboardPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  // ── Users state ────────────────────────────────────────────────────────────
  const [pageData, setPageData] = useState<PageResponse<User> | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(0);

  // ── Posts state ────────────────────────────────────────────────────────────
  const [postsData, setPostsData] = useState<Page<PostResponseDto> | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(0);

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (pageIndex: number) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await adminApi.getAllUsers(pageIndex, 10);
      setPageData(response.data);
    } catch {
      setUsersError("Failed to load users. Please check your permissions.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async (pageIndex: number) => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const response = await adminApi.getAllPosts(pageIndex, 10);
      setPostsData(response.data);
    } catch {
      setPostsError("Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // ── Auth guard + initial load ──────────────────────────────────────────────
  useEffect(() => {
    if (status === "authenticated") {
      if (!isAdmin(user)) { router.replace("/dashboard"); return; }
      fetchUsers(usersPage);
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, user, usersPage, fetchUsers, router]);

  // Load posts when switching to posts tab for the first time
  useEffect(() => {
    if (activeTab === "posts" && status === "authenticated" && isAdmin(user)) {
      fetchPosts(postsPage);
    }
  }, [activeTab, postsPage, status, user, fetchPosts]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (status === "loading" || (usersLoading && !pageData)) {
    return (
      <div className="min-h-screen bg-[#fbf9f9]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="h-6 w-6 rounded-full border-2 border-[#2a676b] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin(user)) return null;

  const isLoading = activeTab === "users" ? usersLoading : postsLoading;

  return (
    <div className="min-h-screen bg-[#fbf9f9]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10">

        {/* Header */}
        <div className="fade-in mb-10 pb-8 border-b border-[#e9e8e7]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-[#2a676b]" />
                <p className="label-caps text-[#2a676b]">Administration</p>
              </div>
              <h1 className="text-3xl font-bold text-[#1b1c1c] font-sans tracking-tight mb-1">
                Admin Panel
              </h1>
              <p className="text-sm text-[#444748] font-sans">
                Manage users, posts, roles, and access.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                activeTab === "users" ? fetchUsers(usersPage) : fetchPosts(postsPage)
              }
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="fade-in flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="story-card">
              <div className="flex items-center gap-2 text-[#747878] font-sans mb-2">
                <Users size={15} />
                <span className="text-xs font-medium uppercase tracking-wide">Total Users</span>
              </div>
              <p className="text-3xl font-bold text-[#1b1c1c] font-sans">
                {pageData?.totalElements ?? 0}
              </p>
            </div>
            <div className="story-card">
              <div className="flex items-center gap-2 text-[#747878] font-sans mb-2">
                <FileText size={15} />
                <span className="text-xs font-medium uppercase tracking-wide">Total Posts</span>
              </div>
              <p className="text-3xl font-bold text-[#1b1c1c] font-sans">
                {postsData?.totalElements ?? "—"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              borderBottom: "1px solid #e9e8e7",
            }}
          >
            {(["users", "posts"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, Manrope, sans-serif)",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #2a676b" : "2px solid transparent",
                  color: activeTab === tab ? "#2a676b" : "#747878",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  textTransform: "capitalize",
                  marginBottom: -1,
                }}
              >
                {tab === "users" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={13} />
                    Users
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={13} />
                    Posts
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Users tab */}
          {activeTab === "users" && (
            <div className="story-card">
              <h2 className="text-base font-semibold text-[#1b1c1c] font-sans mb-6">
                User Directory
              </h2>

              {usersError && <Alert variant="error" message={usersError} />}

              <UserTable
                users={pageData?.content ?? []}
                onRefresh={() => fetchUsers(usersPage)}
              />

              {pageData && pageData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#e9e8e7] pt-5">
                  <p className="text-sm text-[#747878] font-sans">
                    Page{" "}
                    <span className="font-medium text-[#1b1c1c]">{pageData.number + 1}</span>
                    {" "}of{" "}
                    <span className="font-medium text-[#1b1c1c]">{pageData.totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pageData.number === 0 || usersLoading}
                      onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pageData.number >= pageData.totalPages - 1 || usersLoading}
                      onClick={() => setUsersPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts tab */}
          {activeTab === "posts" && (
            <div className="story-card">
              <h2 className="text-base font-semibold text-[#1b1c1c] font-sans mb-6">
                All Posts
              </h2>

              {postsError && <Alert variant="error" message={postsError} />}

              {postsLoading && !postsData ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-5 w-5 rounded-full border-2 border-[#2a676b] border-t-transparent animate-spin" />
                </div>
              ) : (
                <AdminPostTable
                  posts={postsData?.content ?? []}
                  onRefresh={() => fetchPosts(postsPage)}
                />
              )}

              {postsData && postsData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#e9e8e7] pt-5">
                  <p className="text-sm text-[#747878] font-sans">
                    Page{" "}
                    <span className="font-medium text-[#1b1c1c]">{postsData.number + 1}</span>
                    {" "}of{" "}
                    <span className="font-medium text-[#1b1c1c]">{postsData.totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={postsData.number === 0 || postsLoading}
                      onClick={() => setPostsPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={postsData.number >= postsData.totalPages - 1 || postsLoading}
                      onClick={() => setPostsPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
