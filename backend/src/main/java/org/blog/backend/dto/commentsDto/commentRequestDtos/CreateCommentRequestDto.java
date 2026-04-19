package org.blog.backend.dto.commentsDto.commentRequestDtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateCommentRequestDto {

    @NotBlank(message = "The Content Can not be Null")
    @Size(min = 1, max = 1000)
    private String content;

    @NotBlank(message = "Post id  can not be Null")
    private UUID postId;

    // null = top-level comment, otherwise reply to this comment
    private UUID parentCommentId;
}
