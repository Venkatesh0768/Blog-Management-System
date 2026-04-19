package org.blog.backend.services.impl;

import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.AuthDtos.AuthRequestDtos.LoginRequestDto;
import org.blog.backend.dto.AuthDtos.AuthRequestDtos.RegisterRequestDto;
import org.blog.backend.dto.AuthDtos.AuthResponseDtos.UserResponseDto;
import org.blog.backend.exception.EmailAlreadyExitsException;
import org.blog.backend.exception.UsernameAlreadyExitsException;
import org.blog.backend.model.Role;
import org.blog.backend.model.RoleType;
import org.blog.backend.model.User;
import org.blog.backend.repository.RoleRepository;
import org.blog.backend.repository.UserRepository;
import org.blog.backend.services.AuthService;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    @Override
    public UserResponseDto register(RegisterRequestDto registerRequestDto) {
        if (userRepository.existsByEmail(registerRequestDto.getEmail())) {
            throw new EmailAlreadyExitsException("This Email Is Already Exists");
        }

        if (userRepository.existsByUsername(registerRequestDto.getUsername())) {
            throw new UsernameAlreadyExitsException("This Username Is Already Exists");
        }

        Role userRole = roleRepository.findByRoleType(RoleType.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default Role User not Found"));

        User user = User.builder()
                .fullName(registerRequestDto.getFullName())
                .email(registerRequestDto.getEmail())
                .password(registerRequestDto.getPassword())
                .username(registerRequestDto.getUsername())
                .role(Set.of(userRole))
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);


        return toDto(savedUser);

    }

    @Override
    public UserResponseDto login(LoginRequestDto loginRequestDto) {
        return null;
    }


    public UserResponseDto toDto(User user) {
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
