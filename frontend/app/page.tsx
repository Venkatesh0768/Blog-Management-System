"use client";

import React, { useEffect, useState } from "react";
import { getPublicPosts } from "@/lib/api/post.api";
import { Page, PostResponseDto } from "@/types/blog.types";
import PostCard from "@/components/blog/PostCard";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  const { user } = useAuth();
  const [postsPage, setPostsPage] = useState<Page<PostResponseDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPublicPosts(0, 20, "createdAt", "desc");
      setPostsPage(data);
    } catch {
      setError("Failed to load stories.");
    } finally {
      setLoading(false);
    }
  };

  const posts = postsPage?.content ?? [];
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    // Outer shell — full viewport, block display
    <div style={{ minHeight: "100vh", width: "100%", background: "#fbf9f9" }}>
      <Navbar />

      {/* Centered content column */}
      <main
        style={{
          display: "block",
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid #e9e8e7" }}>
          <p
            style={{
              fontFamily: "var(--font-sans, Manrope, sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#2a676b",
              marginBottom: "12px",
            }}
          >
            Latest Stories
          </p>
          <h1
            style={{
              fontFamily: "var(--font-sans, Manrope, sans-serif)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#1b1c1c",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            What&apos;s worth reading today
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "32px",
              padding: "12px 16px",
              background: "rgba(255,218,214,0.6)",
              color: "#93000a",
              border: "1px solid rgba(186,26,26,0.2)",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "var(--font-sans, Manrope, sans-serif)",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "96px 0" }}>
            <Loader2 className="w-6 h-6 animate-spin text-[#2a676b]" />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "96px 0" }}>
            <p style={{ color: "#747878", fontSize: "16px", marginBottom: "24px", fontFamily: "var(--font-sans, Manrope, sans-serif)" }}>
              No stories published yet.
            </p>
            {user && (
              <Link
                href="/dashboard/posts/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background: "#1b1c1c",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontFamily: "var(--font-sans, Manrope, sans-serif)",
                }}
              >
                Be the first to write
              </Link>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {/* Featured hero */}
            {featured && (
              <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid #e9e8e7" }}>
                <PostCard post={featured} variant="featured" />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "32px",
                }}
              >
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e9e8e7", marginTop: "64px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "32px 40px",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontFamily: "var(--font-sans, Manrope, sans-serif)", fontWeight: 700, fontSize: "14px", color: "#1b1c1c" }}>
            StoryStack
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/login" style={{ fontSize: "12px", color: "#747878", textDecoration: "none", fontFamily: "var(--font-sans, Manrope, sans-serif)" }}>
              Sign in
            </Link>
            <Link href="/register" style={{ fontSize: "12px", color: "#747878", textDecoration: "none", fontFamily: "var(--font-sans, Manrope, sans-serif)" }}>
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
