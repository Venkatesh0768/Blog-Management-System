package org.blog.backend.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.blog.backend.auth.dto.ApiResponse;
import org.blog.backend.auth.dto.ChangePasswordRequest;
import org.blog.backend.auth.dto.UpdateProfileRequest;

import org.blog.backend.auth.dto.UserDTO;
import org.blog.backend.auth.exception.UserNotFoundException;
import org.blog.backend.auth.model.User;
import org.blog.backend.auth.repository.UserRepository;
import org.blog.backend.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@Tag(name = "User", description = "Authenticated user self-service operations")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @Operation(summary = "Get current user's full profile")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .provider(user.getProvider())
                .profileImageUrl(user.getProfileImageUrl())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .build();

        return ResponseEntity.ok(new ApiResponse(true, "Profile retrieved", dto));
    }

    @Operation(summary = "Update current user's profile (name, avatar)")
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), request));
    }

    @Operation(summary = "Change password (requires current password)")
    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(authentication.getName(), request));
    }

    @Operation(summary = "Revoke all active sessions (logout all devices)")
    @DeleteMapping("/me/sessions")
    public ResponseEntity<ApiResponse> logoutAll(Authentication authentication) {
        return ResponseEntity.ok(authService.logoutAll(authentication.getName()));
    }
}