"use client";
import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#1b1c1c] hover:bg-black active:bg-[#2a2a2a] text-white border border-[#1b1c1c]",
  secondary:
    "bg-transparent hover:bg-[#efeded] active:bg-[#e9e8e7] text-[#1b1c1c] border border-[#1b1c1c]",
  ghost:
    "bg-transparent hover:bg-[#efeded] active:bg-[#e9e8e7] text-[#444748] hover:text-[#1b1c1c] border border-transparent",
  danger:
    "bg-transparent hover:bg-[#ffdad6] active:bg-[#ffdad6]/80 text-[#ba1a1a] border border-[#ba1a1a]/40 hover:border-[#ba1a1a]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-sans font-semibold",
        "rounded transition-all duration-150 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#2a676b]/50 focus-visible:ring-offset-1",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        "tracking-wide",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && <Loader2 className="animate-spin shrink-0" size={14} />}
      {children}
    </button>
  );
}
