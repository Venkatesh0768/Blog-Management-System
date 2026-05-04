package org.blog.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogoutRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
