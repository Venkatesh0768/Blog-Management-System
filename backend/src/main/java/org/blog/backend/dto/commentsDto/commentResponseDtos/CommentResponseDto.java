package org.blog.backend.dto.commentsDto.commentResponseDtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponseDto {

    private UUID id;
    private String content;

    private UUID userId;
    private String username;

    private UUID postId;
    private UUID parentId;

    private LocalDateTime createdAt;
    private List<CommentResponseDto> replies;
}