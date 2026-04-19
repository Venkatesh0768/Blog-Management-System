package org.blog.backend.dto.PostDtos.PostRequestDtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.blog.backend.model.PostStatus;

public class CreatePostRequestDto {

    @NotBlank(message = "Title Can not be Empty")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @NotBlank(message = "Content cannot be empty")
    @Size(min = 10, message = "Content must be at least 10 characters")
    private String content;

    @NotBlank(message = "Slug is required")
    @Size(min = 3, max = 200)
    @Pattern(
            regexp = "^[a-z0-9-]+$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    private String slug;

    @NotNull(message = "Post status is required")
    private PostStatus postStatus;

}
