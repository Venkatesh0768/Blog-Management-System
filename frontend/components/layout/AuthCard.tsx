import React from "react";
import Link from "next/link";

export function AuthCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f3f3",
        backgroundImage: "radial-gradient(circle, #c4c7c7 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
        }}
        className="fade-in"
      >
        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans, Manrope, sans-serif)",
                fontWeight: 700,
                fontSize: "20px",
                color: "#1b1c1c",
                letterSpacing: "-0.02em",
              }}
            >
              StoryStack
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans, Manrope, sans-serif)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#747878",
              }}
            >
              Editorial Studio
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className={className}
          style={{
            background: "#ffffff",
            border: "1px solid #c4c7c7",
            borderRadius: "8px",
            padding: "40px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
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
    <div style={{ marginBottom: "32px" }}>
      <h1
        style={{
          fontFamily: "var(--font-sans, Manrope, sans-serif)",
          fontSize: "26px",
          fontWeight: 700,
          color: "#1b1c1c",
          letterSpacing: "-0.02em",
          margin: "0 0 8px",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-sans, Manrope, sans-serif)",
            fontSize: "14px",
            color: "#444748",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
