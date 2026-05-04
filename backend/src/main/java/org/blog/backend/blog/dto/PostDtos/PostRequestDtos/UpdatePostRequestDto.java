package org.blog.backend.blog.dto.PostDtos.PostRequestDtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.blog.backend.blog.model.PostStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostRequestDto {

    @NotBlank(message = "Title Can not be Empty")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @NotBlank(message = "Content cannot be empty")
    @Size(min = 10, message = "Content must be at least 10 characters")
    private String content;

    private PostStatus postStatus;
}
