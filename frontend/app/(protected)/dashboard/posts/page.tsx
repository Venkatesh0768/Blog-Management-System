"use client";

import React, { useEffect, useState } from "react";
import { getMyPosts } from "@/lib/api/post.api";
import { PostResponseDto } from "@/types/blog.types";
import PostCard from "@/components/blog/PostCard";
import { Loader2, PenLine } from "lucide-react";
import Link from "next/link";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getMyPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-8 py-10">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-[#e9e8e7]">
        <p className="label-caps text-[#2a676b] mb-2">Your Writing</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1b1c1c] font-sans tracking-tight mb-2">
              My Stories
            </h1>
            <p className="text-sm text-[#444748] font-sans">
              All the stories you have written — drafts and published.
            </p>
          </div>
          <Link
            href="/dashboard/posts/new"
            className="shrink-0 hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#1b1c1c] text-white text-sm font-semibold font-sans rounded hover:bg-black transition-colors"
          >
            <PenLine size={14} />
            New story
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#2a676b]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#747878] font-sans text-sm mb-6">
            You haven&apos;t written any stories yet.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b1c1c] text-white text-sm font-semibold font-sans rounded hover:bg-black transition-colors"
          >
            <PenLine size={14} />
            Start writing
          </Link>
        </div>
      ) : (
        <div className="fade-in">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
