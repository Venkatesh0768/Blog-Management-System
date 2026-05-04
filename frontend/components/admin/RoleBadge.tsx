"use client";
import React from "react";
import type { RoleType } from "@/types/auth.types";
import { roleLabel, roleBadgeClass } from "@/lib/utils/roles";

interface RoleBadgeProps {
  role: RoleType;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(role)}`}
    >
      {roleLabel(role)}
    </span>
  );
}
