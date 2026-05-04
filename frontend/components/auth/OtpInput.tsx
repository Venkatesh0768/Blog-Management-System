"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  const focus = (idx: number) => inputsRef.current[idx]?.focus();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
      const digit = e.target.value.replace(/\D/g, "").slice(-1);
      const chars = value.split("").slice(0, length);
      chars[idx] = digit;
      const next = chars.join("").padEnd(length, "").slice(0, length);
      onChange(next.trimEnd());
      if (digit && idx < length - 1) focus(idx + 1);
    },
    [value, length, onChange]
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const chars = value.split("");
        chars[idx] = "";
        onChange(chars.join("").trimEnd());
      } else if (idx > 0) {
        focus(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focus(idx - 1);
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      focus(idx + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={`flex gap-2.5 justify-center ${shake ? "shake" : ""}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            if (el) inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-11 rounded-xl text-center text-lg font-semibold",
            "bg-white/5 border transition-all outline-none",
            value[idx]
              ? "border-indigo-500 bg-indigo-600/10 text-white"
              : "border-white/10 text-white",
            error
              ? "border-red-500 bg-red-500/10"
              : "focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
