package org.blog.backend.services.impl;

import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.AuthDtos.AuthResponseDtos.UserResponseDto;
import org.blog.backend.dto.UserDtos.UserRequestDto.UpdateUserRequestDto;
import org.blog.backend.exception.UserNotFoundException;
import org.blog.backend.model.User;
import org.blog.backend.repository.UserRepository;
import org.blog.backend.services.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<UserResponseDto> getAllUser() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public UserResponseDto getUserById(UUID uuid) {
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return mapToResponse(user);
    }

    @Override
    public UserResponseDto updateUser(UpdateUserRequestDto requestDto, UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update full name
        if (requestDto.getFullName() != null) {
            user.setFullName(requestDto.getFullName());
        }

        // Update username (only if changed)
        if (requestDto.getUsername() != null &&
                !requestDto.getUsername().equals(user.getUsername())) {

            if (userRepository.existsByUsername(requestDto.getUsername())) {
                throw new RuntimeException("Username already exists");
            }

            user.setUsername(requestDto.getUsername());
        }

        // Update password (encode it)
        if (requestDto.getPassword() != null) {
            String encodedPassword = (requestDto.getPassword());
            user.setPassword(encodedPassword);
        }

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }


    @Override
    public void deleteUser(UUID uuid) {
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        userRepository.delete(user);
    }

    public UserResponseDto mapToResponse(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .password(user.getPassword())
                .username(user.getUsername())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
