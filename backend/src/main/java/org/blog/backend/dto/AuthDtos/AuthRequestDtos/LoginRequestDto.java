package org.blog.backend.dto.AuthDtos.AuthRequestDtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequestDto {

    @Email(message = "Invalid Email Format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6 , max = 100  , message = "Password must be between 6 to 100 Characters")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{6,}$",
            message = "Password must contain at least one letter and one number"
    )
    private String password;

    @NotBlank(message = "username is required")
    @Size(min = 3 , max = 30  , message = "Username  must be between 3 to 30 Characters")
    @Pattern(regexp = "^[a-zA-Z0-9._]+$" , message = "Username can only contain Character and numbers")
    private String username;
}
