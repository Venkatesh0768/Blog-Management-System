"use client";

import React, { useEffect, useState } from "react";
import { getCommentsForPost, addComment } from "@/lib/api/comment.api";
import { CommentResponseDto } from "@/types/blog.types";
import { useAuth } from "@/context/AuthContext";
import { Send, Loader2 } from "lucide-react";
import Link from "next/link";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getCommentsForPost(postId);
      setComments(data || []);
    } catch {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const added = await addComment(user.id, {
        content: newComment,
        postId,
        parentCommentId: null,
      });
      setComments((prev) => [added, ...prev]);
      setNewComment("");
    } catch {
      setError("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#2a676b]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment input */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efeded] border border-[#c4c7c7] text-xs font-semibold text-[#1b1c1c] mt-1">
              {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-[#ffffff] border border-[#c4c7c7] rounded text-sm text-[#1b1c1c] font-sans placeholder:text-[#747878] resize-none focus:outline-none focus:border-[#2a676b] focus:ring-1 focus:ring-[#2a676b]/20 transition-all"
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1b1c1c] text-white text-sm font-semibold rounded hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send size={13} />
                      Respond
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="py-6 border border-[#c4c7c7] rounded bg-[#f5f3f3] text-center">
          <p className="text-sm text-[#444748] font-sans mb-3">
            Join the conversation — sign in to leave a response.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-[#1b1c1c] text-white text-sm font-semibold rounded hover:bg-black transition-colors"
          >
            Sign in to comment
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-[#ba1a1a] font-sans">{error}</p>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-[#747878] font-sans text-center py-4">
            No responses yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efeded] border border-[#c4c7c7] text-xs font-semibold text-[#1b1c1c]">
                {(comment.username?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1b1c1c] font-sans">
                    {comment.username || `User ${comment.userId.slice(0, 8)}`}
                  </span>
                  <span className="text-xs text-[#747878] font-sans">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#444748] font-sans leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
