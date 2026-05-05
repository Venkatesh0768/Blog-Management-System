import apiClient from "./client";
import {
  CommentResponseDto,
  CreateCommentRequestDto,
} from "@/types/blog.types";

export const getCommentsForPost = async (
  postId: string
): Promise<CommentResponseDto[]> => {
  const response = await apiClient.get<CommentResponseDto[]>(`/comments/post/${postId}`);
  return response.data;
};

export const addComment = async (
  userId: string,
  data: CreateCommentRequestDto
): Promise<CommentResponseDto> => {
  const response = await apiClient.post<CommentResponseDto>("/comments", data);
  return response.data;
};
