"use client";
import React, { useState } from "react";
import { adminApi } from "@/lib/api/admin.api";
import { PostResponseDto } from "@/types/blog.types";
import { Alert } from "@/components/ui/Alert";
import { isAxiosError } from "axios";
import { Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AdminPostTableProps {
  posts: PostResponseDto[];
  onRefresh: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function AdminPostTable({ posts, onRefresh }: AdminPostTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (postId: string) => {
    setConfirmId(postId);
    setError(null);
  };

  const handleConfirmDelete = async (postId: string) => {
    setDeletingId(postId);
    setError(null);
    try {
      await adminApi.deletePost(postId);
      setConfirmId(null);
      onRefresh();
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Failed to delete post.");
      } else {
        setError("Failed to delete post.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmId(null);
  };

  if (posts.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "#9a9d9d",
          fontSize: 14,
          fontFamily: "var(--font-sans, Manrope, sans-serif)",
          padding: "32px 0",
        }}
      >
        No posts found.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error" message={error} />
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-sans, Manrope, sans-serif)",
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #e9e8e7",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "8px 12px 10px 0",
                  color: "#747878",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Title
              </th>
              <th
                style={{
                  padding: "8px 12px 10px",
                  color: "#747878",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Author
              </th>
              <th
                style={{
                  padding: "8px 12px 10px",
                  color: "#747878",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "8px 12px 10px",
                  color: "#747878",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "8px 0 10px 12px",
                  color: "#747878",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.filter((post) => post && post.id).map((post) => {
              const isConfirming = confirmId === post.id;
              const isDeleting = deletingId === post.id;
              const excerpt = stripHtml(post.content || "").slice(0, 80);
              const date = new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr
                  key={post.id}
                  style={{
                    borderBottom: "1px solid #f0efed",
                    background: isConfirming ? "rgba(220,38,38,0.03)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Title */}
                  <td
                    style={{
                      padding: "14px 12px 14px 0",
                      maxWidth: 280,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#1b1c1c",
                        marginBottom: 3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {post.title}
                    </div>
                    {excerpt && (
                      <div
                        style={{
                          color: "#9a9d9d",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {excerpt}…
                      </div>
                    )}
                  </td>

                  {/* Author */}
                  <td
                    style={{
                      padding: "14px 12px",
                      color: "#444748",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.authorName ?? "—"}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 99,
                        background:
                          post.postStatus === "PUBLISHED"
                            ? "rgba(42,103,107,0.09)"
                            : "rgba(116,120,120,0.1)",
                        color:
                          post.postStatus === "PUBLISHED" ? "#2a676b" : "#747878",
                        border: `1px solid ${
                          post.postStatus === "PUBLISHED"
                            ? "rgba(42,103,107,0.2)"
                            : "rgba(116,120,120,0.2)"
                        }`,
                      }}
                    >
                      {post.postStatus === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>

                  {/* Date */}
                  <td
                    style={{
                      padding: "14px 12px",
                      color: "#9a9d9d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {date}
                  </td>

                  {/* Actions */}
                  <td
                    style={{
                      padding: "14px 0 14px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isConfirming ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#dc2626",
                            fontWeight: 500,
                          }}
                        >
                          Delete?
                        </span>
                        <button
                          onClick={() => handleConfirmDelete(post.id)}
                          disabled={isDeleting}
                          style={{
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.6 : 1,
                            fontFamily: "var(--font-sans, Manrope, sans-serif)",
                          }}
                        >
                          {isDeleting ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          disabled={isDeleting}
                          style={{
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            background: "transparent",
                            color: "#444748",
                            border: "1px solid #d4d4d4",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontFamily: "var(--font-sans, Manrope, sans-serif)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Link
                          href={`/post/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View post"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            color: "#747878",
                            textDecoration: "none",
                            transition: "background 0.15s, color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#f0efed";
                            (e.currentTarget as HTMLElement).style.color = "#1b1c1c";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#747878";
                          }}
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(post.id)}
                          title="Delete post"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            background: "transparent",
                            border: "none",
                            color: "#747878",
                            cursor: "pointer",
                            transition: "background 0.15s, color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(220,38,38,0.08)";
                            (e.currentTarget as HTMLElement).style.color = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#747878";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
