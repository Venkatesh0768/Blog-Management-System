import apiClient from "./client";
import {
  Page,
  PostResponseDto,
  CreatePostRequestDto,
  UpdatePostRequestDto,
} from "@/types/blog.types";

export const getPublicPosts = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  sortDir: string = "desc"
): Promise<Page<PostResponseDto>> => {
  const response = await apiClient.get<Page<PostResponseDto>>("/public/posts", {
    params: { page, size, sortBy, sortDir },
  });
  return response.data;
};
export const getPublicPostById = async (id: string): Promise<PostResponseDto> => {
  const response = await apiClient.get<PostResponseDto>(`/public/posts/${id}`);
  return response.data;
};

export const getPublicPostBySlug = async (slug: string): Promise<PostResponseDto> => {
  const response = await apiClient.get<PostResponseDto>(`/public/posts/slug/${slug}`);
  return response.data;
};

export const createPost = async (
  data: CreatePostRequestDto
): Promise<PostResponseDto> => {
  const response = await apiClient.post<PostResponseDto>("/posts/create", data);
  return response.data;
};

export const updatePost = async (
  postId: string,
  data: UpdatePostRequestDto
): Promise<PostResponseDto> => {
  const response = await apiClient.patch<PostResponseDto>(`/posts/${postId}`, data);
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

export const getMyPosts = async (): Promise<PostResponseDto[]> => {
  const response = await apiClient.get<PostResponseDto[]>("/posts/me");
  return response.data;
};
