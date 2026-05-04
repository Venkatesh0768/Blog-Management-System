package org.blog.backend.blog.controller;

import lombok.RequiredArgsConstructor;
import org.blog.backend.blog.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.blog.dto.commentsDto.commentResponseDtos.CommentResponseDto;
import org.blog.backend.blog.services.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // Add comment or reply
    @PostMapping("/{userId}")
    public ResponseEntity<CommentResponseDto> addComment(
            @RequestBody CreateCommentRequestDto dto,
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(commentService.addComment(dto, userId));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable UUID postId
    ) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }
}