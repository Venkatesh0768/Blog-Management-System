"use client";
import React from "react";
import type { RoleType } from "@/types/auth.types";
import { roleLabel } from "@/lib/utils/roles";

interface RoleBadgeProps {
  role: RoleType;
}

const roleStyles: Record<RoleType, string> = {
  ROLE_ADMIN:
    "bg-[#ffdad6]/60 text-[#93000a] border border-[#ba1a1a]/20",
  ROLE_VENDOR:
    "bg-amber-50 text-amber-800 border border-amber-200",
  ROLE_USER:
    "bg-[#efeded] text-[#444748] border border-[#c4c7c7]",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-sm uppercase tracking-wide ${roleStyles[role] ?? "bg-[#efeded] text-[#444748] border border-[#c4c7c7]"}`}
    >
      {roleLabel(role)}
    </span>
  );
}
