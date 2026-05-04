package org.blog.backend.blog.services;

import org.blog.backend.blog.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.blog.dto.commentsDto.commentResponseDtos.CommentResponseDto;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponseDto addComment(CreateCommentRequestDto requestDto , UUID userId);
     List<CommentResponseDto> getCommentsForPost(UUID postId);
}
