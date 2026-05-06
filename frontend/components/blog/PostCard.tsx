"use client";

import React from "react";
import Link from "next/link";
import { PostResponseDto } from "@/types/blog.types";
import { MessageSquare, Clock } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML tags → plain text for excerpts & read-time */
function stripHtml(html: string): string {
  if (typeof window !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent ?? tmp.innerText ?? "";
  }
  // SSR fallback
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Pull first <img src> from HTML content */
function firstImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Deterministic pastel hue from a string */
function nameHue(str: string): number {
  return (str.charCodeAt(0) * 37 + (str.charCodeAt(1) ?? 0) * 13) % 360;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const published = status === "PUBLISHED";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        fontFamily: "var(--font-sans, Manrope, sans-serif)",
        padding: "2px 8px",
        borderRadius: 99,
        background: published ? "rgba(42,103,107,0.09)" : "rgba(116,120,120,0.1)",
        color: published ? "#2a676b" : "#747878",
        border: `1px solid ${published ? "rgba(42,103,107,0.2)" : "rgba(116,120,120,0.2)"}`,
      }}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function Meta({ date, readTime, comments }: { date: string; readTime: number; comments: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        color: "#9a9d9d",
        fontFamily: "var(--font-sans, Manrope, sans-serif)",
      }}
    >
      <span>{date}</span>
      <Dot />
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Clock size={10} style={{ opacity: 0.6 }} />
        {readTime} min
      </span>
      {comments > 0 && (
        <>
          <Dot />
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MessageSquare size={10} style={{ opacity: 0.6 }} />
            {comments}
          </span>
        </>
      )}
    </div>
  );
}

function Dot() {
  return <span style={{ color: "#d4d4d4", fontSize: 10 }}>·</span>;
}

function Thumbnail({
  src,
  title,
  size = "md",
}: {
  src: string | null;
  title: string;
  size?: "sm" | "md" | "lg";
}) {
  const hue = nameHue(title);
  const dims: Record<string, { w: number | string; h: number }> = {
    sm: { w: 80, h: 56 },
    md: { w: 112, h: 72 },
    lg: { w: "100%", h: 240 },
  };
  const { w, h } = dims[size];

  return (
    <div
      style={{
        width: w,
        height: h,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: size === "lg" ? 6 : 4,
        background: `hsl(${hue},30%,92%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={title}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <span
          style={{
            fontSize: size === "lg" ? 56 : 22,
            fontWeight: 800,
            color: `hsl(${hue},40%,72%)`,
            fontFamily: "Georgia, serif",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          {title.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─── Card variants ────────────────────────────────────────────────────────────

interface PostCardProps {
  post: PostResponseDto;
  variant?: "grid" | "list" | "featured";
}

export default function PostCard({ post, variant = "grid" }: PostCardProps) {
  // Guard against missing post data
  if (!post || !post.id) {
    return null;
  }

  const plain = stripHtml(post.content || "");
  const readTime = Math.max(1, Math.ceil(plain.split(/\s+/).length / 200));
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Best cover image: explicit imageUrls first, then first inline <img>
  const coverImage =
    post.imageUrls?.[0] ??
    firstImageFromContent(post.content || "") ??
    null;

  const commentCount = post.commentIds?.length ?? 0;

  // ── Featured ──────────────────────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <article
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
        className="featured-card"
      >
        <style>{`
          @media (max-width: 768px) {
            .featured-card { grid-template-columns: 1fr !important; }
            .featured-img { order: -1; }
          }
        `}</style>

        {/* Text */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <StatusBadge status={post.postStatus} />
            <span style={{ fontSize: 11, color: "#9a9d9d", fontFamily: "var(--font-sans, Manrope, sans-serif)" }}>{date}</span>
          </div>

          <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(24px, 3vw, 34px)",
                fontWeight: 700,
                color: "#1b1c1c",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: 14,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2a676b")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1b1c1c")}
            >
              {post.title}
            </h2>
          </Link>

          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 16,
              color: "#555",
              lineHeight: 1.7,
              marginBottom: 20,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {plain}
          </p>

          <Meta date={date} readTime={readTime} comments={commentCount} />
        </div>

        {/* Image */}
        <div className="featured-img">
          <Link href={`/post/${post.id}`} style={{ display: "block", textDecoration: "none" }}>
            <Thumbnail src={coverImage} title={post.title} size="lg" />
          </Link>
        </div>
      </article>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────
  if (variant === "list") {
    return (
      <article
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          padding: "22px 0",
          borderBottom: "1px solid #ededec",
        }}
      >
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <StatusBadge status={post.postStatus} />
          </div>

          <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#1b1c1c",
                lineHeight: 1.3,
                letterSpacing: "-0.015em",
                marginBottom: 6,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2a676b")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1b1c1c")}
            >
              {post.title}
            </h2>
          </Link>

          <p
            style={{
              fontFamily: "var(--font-sans, Manrope, sans-serif)",
              fontSize: 13,
              color: "#666",
              lineHeight: 1.6,
              marginBottom: 10,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {plain}
          </p>

          <Meta date={date} readTime={readTime} comments={commentCount} />
        </div>

        {/* Thumbnail */}
        <Link href={`/post/${post.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Thumbnail src={coverImage} title={post.title} size="md" />
        </Link>
      </article>
    );
  }

  // ── Grid (default) ────────────────────────────────────────────────────────
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #ededec",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      {/* Cover */}
      <Link href={`/post/${post.id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ height: 176, overflow: "hidden" }}>
          <Thumbnail src={coverImage} title={post.title} size="lg" />
        </div>
      </Link>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px 16px" }}>
        <div style={{ marginBottom: 10 }}>
          <StatusBadge status={post.postStatus} />
        </div>

        <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#1b1c1c",
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
              marginBottom: 8,
              transition: "color 0.15s",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2a676b")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#1b1c1c")}
          >
            {post.title}
          </h2>
        </Link>

        <p
          style={{
            fontFamily: "var(--font-sans, Manrope, sans-serif)",
            fontSize: 13,
            color: "#666",
            lineHeight: 1.6,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {plain}
        </p>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #f0efed",
          }}
        >
          <Meta date={date} readTime={readTime} comments={commentCount} />
        </div>
      </div>
    </article>
  );
}