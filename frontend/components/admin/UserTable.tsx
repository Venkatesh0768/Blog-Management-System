"use client";
import React, { useState } from "react";
import { adminApi } from "@/lib/api/admin.api";
import { RoleBadge } from "./RoleBadge";
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
    } catch {
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
    if (editRoles.length === 0) { setError("User must have at least one role."); return; }
    setActionLoading(userId);
    setError(null);
    try {
      await adminApi.assignRoles(userId, { roles: editRoles });
      setEditingId(null);
      onRefresh();
    } catch {
      setError("Failed to update roles.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setActionLoading(user.id);
    setError(null);
    try {
      await adminApi.deleteUser(user.id);
      onRefresh();
    } catch {
      setError("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="error" message={error} />}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-[#e9e8e7]">
              <th className="pb-3 pr-6 text-xs font-semibold text-[#747878] uppercase tracking-wide">User</th>
              <th className="pb-3 pr-6 text-xs font-semibold text-[#747878] uppercase tracking-wide">Roles</th>
              <th className="pb-3 pr-6 text-xs font-semibold text-[#747878] uppercase tracking-wide">Status</th>
              <th className="pb-3 text-xs font-semibold text-[#747878] uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e8e7]">
            {users.map((u) => {
              const isEditing = editingId === u.id;
              const isLoading = actionLoading === u.id;

              return (
                <tr key={u.id} className="hover:bg-[#f5f3f3] transition-colors">
                  <td className="py-4 pr-6">
                    <div>
                      <div className="font-medium text-[#1b1c1c]">{displayName(u)}</div>
                      <div className="text-xs text-[#747878] mt-0.5">{u.email}</div>
                      {!u.emailVerified && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-sm uppercase tracking-wide">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-6">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(["ROLE_USER", "ROLE_ADMIN", "ROLE_VENDOR"] as RoleType[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleToggle(role)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                              editRoles.includes(role)
                                ? "bg-[#1b1c1c] text-white border-[#1b1c1c]"
                                : "bg-transparent text-[#444748] border-[#c4c7c7] hover:border-[#747878]"
                            }`}
                          >
                            {role.replace("ROLE_", "")}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <RoleBadge key={r} role={r as RoleType} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border ${
                        u.enabled
                          ? "bg-[rgba(42,103,107,0.08)] text-[#2a676b] border-[rgba(42,103,107,0.2)]"
                          : "bg-[#ffdad6]/40 text-[#93000a] border-[#ba1a1a]/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.enabled ? "bg-[#2a676b]" : "bg-[#ba1a1a]"}`} />
                      {u.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isLoading}
                          className="p-1.5 text-[#747878] hover:text-[#1b1c1c] hover:bg-[#efeded] rounded transition-colors"
                          aria-label="Cancel"
                        >
                          <X size={15} />
                        </button>
                        <button
                          onClick={() => saveRoles(u.id)}
                          disabled={isLoading}
                          className="p-1.5 text-[#2a676b] hover:bg-[rgba(42,103,107,0.1)] rounded transition-colors"
                          aria-label="Save"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStatusToggle(u)}
                          disabled={isLoading}
                          className="p-1.5 text-[#747878] hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          title={u.enabled ? "Disable user" : "Enable user"}
                        >
                          <ShieldAlert size={15} />
                        </button>
                        <button
                          onClick={() => startEdit(u)}
                          disabled={isLoading}
                          className="p-1.5 text-[#747878] hover:text-[#1b1c1c] hover:bg-[#efeded] rounded transition-colors"
                          title="Edit roles"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isLoading}
                          className="p-1.5 text-[#747878] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-[#747878] font-sans">
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
