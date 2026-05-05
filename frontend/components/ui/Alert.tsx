"use client";
import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  message: string | null | undefined;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ReactNode; cls: string }> = {
  success: {
    icon: <CheckCircle2 size={15} />,
    cls: "bg-[rgba(42,103,107,0.08)] text-[#2a676b] border border-[rgba(42,103,107,0.2)]",
  },
  error: {
    icon: <XCircle size={15} />,
    cls: "bg-[#ffdad6]/60 text-[#93000a] border border-[#ba1a1a]/20",
  },
  warning: {
    icon: <AlertCircle size={15} />,
    cls: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  info: {
    icon: <Info size={15} />,
    cls: "bg-[#efeded] text-[#444748] border border-[#c4c7c7]",
  },
};

export function Alert({ variant = "info", message, className = "" }: AlertProps) {
  if (!message) return null;
  const { icon, cls } = config[variant];

  return (
    <div
      className={[
        "flex items-start gap-2.5 rounded px-3.5 py-3 text-sm leading-snug font-sans",
        cls,
        className,
      ].join(" ")}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
