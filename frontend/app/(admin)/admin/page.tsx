"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { UserTable } from "@/components/admin/UserTable";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { adminApi, PageResponse } from "@/lib/api/admin.api";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/utils/roles";
import { Shield, Users, RefreshCw } from "lucide-react";
import { User } from "@/types/auth.types";

export default function AdminDashboardPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  const [pageData, setPageData] = useState<PageResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetchUsers = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllUsers(pageIndex, 10);
      setPageData(response.data);
    } catch (err) {
      setError("Failed to load users. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if authenticated
    if (status === "authenticated") {
      if (!isAdmin(user)) {
        router.replace("/dashboard");
        return;
      }
      fetchUsers(page);
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, user, page, fetchUsers, router]);

  if (status === "loading" || loading && !pageData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // Security fallback
  if (!isAdmin(user)) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="fade-in mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <Shield size={20} />
              </div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            </div>
            <p className="text-slate-400">
              Manage users, assign roles, and control access.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => fetchUsers(page)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        <div className="fade-in flex flex-col gap-5">
          {error && <Alert variant="error" message={error} />}

          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Users size={18} />
                <h3 className="text-sm font-medium">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {pageData?.totalElements ?? 0}
              </p>
            </div>
            {/* Add more stats here later if needed */}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">User Directory</h2>
            
            <UserTable 
              users={pageData?.content ?? []} 
              onRefresh={() => fetchUsers(page)} 
            />

            {/* Pagination */}
            {pageData && pageData.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <p className="text-sm text-slate-400">
                  Showing page <span className="font-medium text-white">{pageData.number + 1}</span> of{" "}
                  <span className="font-medium text-white">{pageData.totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pageData.number === 0 || loading}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pageData.number >= pageData.totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
