package org.blog.backend.dto.PostDtos.PostResponseDtos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.blog.backend.model.Comment;
import org.blog.backend.model.PostImages;
import org.blog.backend.model.PostStatus;
import org.blog.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostResponseDto {
    private UUID id;
    private String title;
    private String content;
    private String slug;
    private PostStatus postStatus;
    private UUID userId;
    private List<Comment> comments;
    private List<PostImages> postImages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
