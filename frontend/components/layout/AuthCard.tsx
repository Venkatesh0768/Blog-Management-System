import React from "react";

export function AuthCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="bg-auth min-h-screen flex items-center justify-center p-4">
      <div
        className={[
          "glass-card fade-in w-full max-w-md p-8",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </main>
  );
}

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 ring-1 ring-indigo-500/30">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-indigo-400"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
