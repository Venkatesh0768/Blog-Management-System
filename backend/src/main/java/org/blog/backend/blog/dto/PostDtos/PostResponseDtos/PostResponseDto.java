package org.blog.backend.blog.dto.PostDtos.PostResponseDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.blog.backend.blog.model.PostStatus;

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
    private String authorName;
    private List<UUID> commentIds;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
