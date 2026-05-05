"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getPublicPostById } from "@/lib/api/post.api";
import { PostResponseDto } from "@/types/blog.types";
import { Loader2, ArrowLeft, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";
import CommentsSection from "@/components/blog/CommentsSection";
import { Navbar } from "@/components/layout/Navbar";

// ─── Reading progress bar ─────────────────────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "2px",
        zIndex: 999,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "#2a676b",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

// ─── Prose content renderer ───────────────────────────────────────────────────
// Handles both legacy plain-text (newline-separated) and new HTML content

function ProseContent({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Detect if content is HTML (created by the new editor)
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  // For HTML: sanitise & inject; for plain: convert to paragraphs
  useEffect(() => {
    if (!ref.current) return;
    if (isHtml) {
      // Inject as HTML — links open in new tab, images get lazy loading
      ref.current.innerHTML = content;
      ref.current.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
      ref.current.querySelectorAll("img").forEach((img) => {
        img.loading = "lazy";
        img.decoding = "async";
      });
    } else {
      // Legacy plain text: split on blank lines → <p> tags
      ref.current.innerHTML = content
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
    }
  }, [content, isHtml]);

  return (
    <div
      ref={ref}
      className="post-prose"
    />
  );
}

// ─── Author avatar ────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  // Deterministic pastel bg from name
  const hue = (name.charCodeAt(0) * 37) % 360;
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: `hsl(${hue}, 40%, 88%)`,
        border: "1.5px solid rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 700,
        color: `hsl(${hue}, 50%, 35%)`,
        flexShrink: 0,
        fontFamily: "var(--font-sans, Manrope, sans-serif)",
        letterSpacing: "-0.01em",
      }}
    >
      {initial}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ paddingTop: 72, paddingBottom: 80 }}>
      <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6, marginBottom: 48 }} />
      <div className="skeleton" style={{ height: 44, width: "80%", borderRadius: 8, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 44, width: "55%", borderRadius: 8, marginBottom: 36 }} />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 48 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
        <div>
          <div className="skeleton" style={{ height: 13, width: 120, borderRadius: 4, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: 90, borderRadius: 4 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 360, width: "100%", borderRadius: 8, marginBottom: 48 }} />
      {[100, 90, 95, 80, 88].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 18, width: `${w}%`, borderRadius: 4, marginBottom: 14 }} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const colStyle: React.CSSProperties = {
  maxWidth: 740,
  margin: "0 auto",
  padding: "0 24px",
  boxSizing: "border-box",
  width: "100%",
};

export default function PostPage() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPublicPostById(id);
        setPost(data);
      } catch {
        setError("Failed to load this story. It may not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const date = post
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const readTime = post
    ? Math.max(1, Math.ceil(post.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200))
    : 0;

  const authorName = post?.authorName || (post ? `User ${post.userId.slice(0, 6)}` : "");

  return (
    <>
      {/* Global prose + animation styles */}
      <style>{`
        /* ── Skeleton ── */
        .skeleton {
          background: linear-gradient(90deg, #f0efed 25%, #e9e8e7 50%, #f0efed 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── Page fade ── */
        .post-fade-in {
          animation: postFade 0.4s ease both;
        }
        @keyframes postFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

        /* ── Rich prose ── */
        .post-prose {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: clamp(18px, 2vw, 20px);
          line-height: 1.82;
          color: #1b1c1c;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .post-prose p { margin: 0 0 1.5em; }
        .post-prose p:last-child { margin-bottom: 0; }
        .post-prose h2 {
          font-family: 'Georgia', serif;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 700;
          line-height: 1.3;
          margin: 1.8em 0 0.5em;
          color: #111;
          letter-spacing: -0.02em;
        }
        .post-prose h3 {
          font-family: 'Georgia', serif;
          font-size: clamp(18px, 2.2vw, 22px);
          font-weight: 600;
          line-height: 1.35;
          margin: 1.5em 0 0.4em;
          color: #1b1c1c;
        }
        .post-prose blockquote {
          border-left: 3px solid #1b1c1c;
          margin: 2em 0;
          padding: 2px 0 2px 28px;
          font-style: italic;
          font-size: clamp(20px, 2.4vw, 24px);
          color: #333;
          line-height: 1.65;
        }
        .post-prose code {
          background: #f3f1ef;
          padding: 2px 7px;
          border-radius: 4px;
          font-family: 'Fira Mono', 'Courier New', monospace;
          font-size: 0.82em;
          color: #c7254e;
        }
        .post-prose pre {
          background: #1b1c1c;
          color: #f8f8f2;
          padding: 20px 24px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Fira Mono', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          margin: 2em 0;
        }
        .post-prose pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        .post-prose a {
          color: #2a676b;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
          transition: opacity 0.15s;
        }
        .post-prose a:hover { opacity: 0.7; }
        .post-prose ul, .post-prose ol {
          margin: 1em 0 1.5em;
          padding-left: 28px;
        }
        .post-prose li { margin-bottom: 0.4em; }
        .post-prose hr {
          border: none;
          display: block;
          margin: 3em auto;
          width: 64px;
          border-top: 1.5px solid #c4c7c7;
        }
        /* Inline images — bleed slightly beyond text column */
        .post-prose figure {
          margin: 2.5em -24px;
          text-align: center;
        }
        .post-prose figure img {
          max-width: 100%;
          width: 100%;
          border-radius: 6px;
          display: block;
        }
        .post-prose figcaption {
          margin-top: 10px;
          font-size: 13px;
          color: #999;
          font-style: italic;
          font-family: var(--font-sans, Manrope, sans-serif);
          text-align: center;
        }
        /* Stand-alone img tags (legacy) */
        .post-prose > img, .post-prose p > img {
          max-width: 100%;
          border-radius: 6px;
          margin: 1.5em 0;
          display: block;
        }

        @media (max-width: 640px) {
          .post-prose figure { margin-left: -16px; margin-right: -16px; }
        }
      `}</style>

      <ReadingProgressBar />

      <div style={{ minHeight: "100vh", background: "#fbf9f9" }}>
        <Navbar />

        {loading ? (
          <div style={colStyle}>
            <Skeleton />
          </div>
        ) : error || !post ? (
          <div style={{ ...colStyle, paddingTop: 96, paddingBottom: 80, textAlign: "center" }}>
            <p style={{ color: "#ba1a1a", fontSize: 14, marginBottom: 24, fontFamily: "var(--font-sans, Manrope, sans-serif)" }}>
              {error || "Story not found."}
            </p>
            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#444748", textDecoration: "none", fontFamily: "var(--font-sans, Manrope, sans-serif)" }}
            >
              <ArrowLeft size={14} /> Back to stories
            </Link>
          </div>
        ) : (
          <main style={{ ...colStyle, paddingTop: 48, paddingBottom: 96 }} className="post-fade-in">

            {/* Back */}
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#747878",
                textDecoration: "none",
                fontFamily: "var(--font-sans, Manrope, sans-serif)",
                marginBottom: 48,
                letterSpacing: "0.01em",
              }}
            >
              <ArrowLeft size={13} /> All stories
            </Link>

            <article>
              {/* ── Title ── */}
              <h1
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(28px, 4.5vw, 46px)",
                  fontWeight: 700,
                  color: "#111",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: 20,
                }}
              >
                {post.title}
              </h1>

              {/* ── Author row ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingBottom: 28,
                  borderBottom: "1px solid #e9e8e7",
                  marginBottom: 48,
                }}
              >
                <Avatar name={authorName} />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1b1c1c",
                      fontFamily: "var(--font-sans, Manrope, sans-serif)",
                    }}
                  >
                    {authorName}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12,
                      color: "#747878",
                      fontFamily: "var(--font-sans, Manrope, sans-serif)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {date}
                    <span style={{ opacity: 0.4 }}>·</span>
                    <BookOpen size={11} style={{ opacity: 0.5 }} />
                    {readTime} min read
                  </p>
                </div>
              </div>

              {/* ── Hero image (first imageUrl if present AND content has no inline images) ── */}
              {post.imageUrls?.[0] && !/<img/i.test(post.content) && (
                <figure style={{ margin: "0 -24px 48px", textAlign: "center" }}>
                  <img
                    src={post.imageUrls[0]}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      maxHeight: 520,
                      objectFit: "cover",
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                </figure>
              )}

              {/* ── Prose content ── */}
              <ProseContent content={post.content} />

              {/* ── Extra image grid (legacy posts only — new posts embed inline) ── */}
              {post.imageUrls && post.imageUrls.length > 1 && !/<img/i.test(post.content) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: 12,
                    marginTop: 48,
                  }}
                >
                  {post.imageUrls.slice(1).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Image ${idx + 2}`}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        borderRadius: 6,
                        display: "block",
                        background: "#efeded",
                      }}
                    />
                  ))}
                </div>
              )}
            </article>

            {/* ── Divider ── */}
            <div style={{ borderTop: "1px solid #e9e8e7", margin: "72px 0 0" }} />

            {/* ── Comments toggle ── */}
            <section style={{ marginTop: 56 }}>
              <button
                type="button"
                onClick={() => setShowComments((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, Manrope, sans-serif)",
                  color: "#1b1c1c",
                  background: "none",
                  border: "1px solid #c4c7c7",
                  borderRadius: 24,
                  padding: "10px 20px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  marginBottom: 32,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a676b";
                  (e.currentTarget as HTMLButtonElement).style.color = "#2a676b";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#c4c7c7";
                  (e.currentTarget as HTMLButtonElement).style.color = "#1b1c1c";
                }}
              >
                <MessageCircle size={16} />
                {showComments ? "Hide" : "Show"} responses
                {post.commentIds?.length > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      background: "#2a676b",
                      color: "#fff",
                      borderRadius: 99,
                      padding: "1px 8px",
                      marginLeft: 2,
                    }}
                  >
                    {post.commentIds.length}
                  </span>
                )}
              </button>

              {showComments && <CommentsSection postId={post.id} />}
            </section>
          </main>
        )}

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid #e9e8e7" }}>
          <div
            style={{
              ...colStyle,
              paddingTop: 28,
              paddingBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans, Manrope, sans-serif)",
                fontWeight: 800,
                fontSize: 15,
                color: "#1b1c1c",
                letterSpacing: "-0.02em",
              }}
            >
              StoryStack
            </span>
            <Link
              href="/"
              style={{
                fontSize: 12,
                color: "#747878",
                textDecoration: "none",
                fontFamily: "var(--font-sans, Manrope, sans-serif)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <ArrowLeft size={11} /> All stories
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}