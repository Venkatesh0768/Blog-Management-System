package org.blog.backend.services;

import org.blog.backend.dto.AuthDtos.AuthRequestDtos.LoginRequestDto;
import org.blog.backend.dto.AuthDtos.AuthRequestDtos.RegisterRequestDto;
import org.blog.backend.dto.AuthDtos.AuthResponseDtos.UserResponseDto;

public interface AuthService {
    UserResponseDto register(RegisterRequestDto registerRequestDto);
    UserResponseDto login(LoginRequestDto loginRequestDto);
}
