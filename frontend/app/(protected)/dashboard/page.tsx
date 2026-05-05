"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublicPosts } from "@/lib/api/post.api";
import { Page, PostResponseDto } from "@/types/blog.types";
import PostCard from "@/components/blog/PostCard";
import { PenLine } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [postsPage, setPostsPage] = useState<Page<PostResponseDto> | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await getPublicPosts(0, 12, "createdAt", "desc");
      setPostsPage(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-6xl px-6 py-10">
      
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          
          {/* Left */}
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
              Story Library
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Curate and manage your collection of narratives. From raw drafts to published features, your complete editorial archive is preserved here.
            </p>
          </div>

          {/* Right Button */}
          <Link
            href="/dashboard/posts/new"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
          >
            <PenLine size={14} />
            New story
          </Link>
        </div>
      </div>

      {/* Posts */}
      <div>
        {loadingPosts ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
          </div>
        ) : postsPage?.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500 text-sm mb-6">
              No stories published yet.
            </p>
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
            >
              <PenLine size={14} />
              Write your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {postsPage?.content.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}
