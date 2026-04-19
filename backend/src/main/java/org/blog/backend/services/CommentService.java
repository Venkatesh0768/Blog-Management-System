package org.blog.backend.services;

import jdk.dynalink.linker.LinkerServices;
import org.blog.backend.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.dto.commentsDto.commentResponseDtos.CommentResponseDto;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    CommentResponseDto addComment(CreateCommentRequestDto requestDto , UUID userId);
     List<CommentResponseDto> getCommentsForPost(UUID postId);
}
