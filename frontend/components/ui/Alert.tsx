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
    icon: <CheckCircle2 size={16} />,
    cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  error: {
    icon: <XCircle size={16} />,
    cls: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  warning: {
    icon: <AlertCircle size={16} />,
    cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  info: {
    icon: <Info size={16} />,
    cls: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  },
};

export function Alert({ variant = "info", message, className = "" }: AlertProps) {
  if (!message) return null;
  const { icon, cls } = config[variant];

  return (
    <div
      className={[
        "flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-snug",
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
