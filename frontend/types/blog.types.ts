export type PostStatus = "DRAFT" | "PUBLISHED";

export interface PostResponseDto {
  id: string;
  title: string;
  content: string;
  slug: string;
  postStatus: PostStatus;
  userId: string;
  authorName?: string;
  commentIds: string[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequestDto {
  title: string;
  content: string;
  postStatus: PostStatus;
}

export interface UpdatePostRequestDto {
  title?: string;
  content?: string;
  postStatus?: PostStatus;
}

export interface CommentResponseDto {
  id: string;
  content: string;
  userId: string;
  username: string;
  postId: string;
  parentId: string | null;
  createdAt: string;
  replies: CommentResponseDto[];
}

export interface CreateCommentRequestDto {
  content: string;
  postId: string;
  parentCommentId: string | null;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}
