package org.blog.backend.services;

import org.blog.backend.dto.AuthDtos.AuthResponseDtos.UserResponseDto;
import org.blog.backend.dto.UserDtos.UserRequestDto.UpdateUserRequestDto;
import org.blog.backend.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponseDto> getAllUser();
    UserResponseDto getUserById(UUID uuid);
    UserResponseDto updateUser(UpdateUserRequestDto requestDto , UUID id);
    void deleteUser(UUID uuid);
}
