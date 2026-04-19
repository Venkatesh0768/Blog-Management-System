package org.blog.backend.dto.PostDtos.PostResponseDtos;

import jakarta.persistence.*;
import org.blog.backend.model.Comment;
import org.blog.backend.model.PostStatus;
import org.blog.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PostResponseDto {
    private UUID id;
    private String title;
    private String content;
    private String slug;
    private PostStatus postStatus;
    private User user;
    private List<Comment> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
