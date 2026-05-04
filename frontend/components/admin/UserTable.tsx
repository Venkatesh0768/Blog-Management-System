"use client";
import React, { useState } from "react";
import { adminApi } from "@/lib/api/admin.api";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { User, RoleType } from "@/types/auth.types";
import { isAxiosError } from "axios";
import { Check, Edit, ShieldAlert, Trash2, X } from "lucide-react";
import { displayName } from "@/lib/utils/roles";

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<RoleType[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusToggle = async (user: User) => {
    setActionLoading(user.id);
    setError(null);
    try {
      await adminApi.setUserStatus(user.id, !user.enabled);
      onRefresh();
    } catch (err) {
      setError("Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditRoles([...user.roles]);
  };

  const handleRoleToggle = (role: RoleType) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async (userId: string) => {
    if (editRoles.length === 0) {
      setError("User must have at least one role.");
      return;
    }
    setActionLoading(userId);
    setError(null);
    try {
      await adminApi.assignRoles(userId, { roles: editRoles });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      setError("Failed to update roles.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;
    setActionLoading(user.id);
    setError(null);
    try {
      await adminApi.deleteUser(user.id);
      onRefresh();
    } catch (err) {
      setError("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="error" message={error} />}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Roles</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => {
              const isEditing = editingId === u.id;
              const isLoading = actionLoading === u.id;

              return (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-slate-200">
                          {displayName(u)}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      {!u.emailVerified && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {(["ROLE_USER", "ROLE_ADMIN", "ROLE_VENDOR"] as RoleType[]).map(
                          (role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleToggle(role)}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                                editRoles.includes(role)
                                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                              }`}
                            >
                              {role.replace("ROLE_", "")}
                            </button>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <RoleBadge key={r} role={r as RoleType} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.enabled ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {u.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isLoading}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
                          aria-label="Cancel"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => saveRoles(u.id)}
                          disabled={isLoading}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-500/20 transition-colors"
                          aria-label="Save"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusToggle(u)}
                          disabled={isLoading}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-amber-500/20 transition-colors"
                          title={u.enabled ? "Disable user" : "Enable user"}
                        >
                          <ShieldAlert size={16} />
                        </button>
                        <button
                          onClick={() => startEdit(u)}
                          disabled={isLoading}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-indigo-500/20 transition-colors"
                          title="Edit roles"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isLoading}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
