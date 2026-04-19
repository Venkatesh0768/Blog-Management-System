package org.blog.backend.controller;

import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.AuthDtos.AuthRequestDtos.RegisterRequestDto;
import org.blog.backend.dto.AuthDtos.AuthResponseDtos.UserResponseDto;
import org.blog.backend.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> registerUser(@RequestBody RegisterRequestDto responseDto){
        return new ResponseEntity<>(authService.register(responseDto) , HttpStatus.CREATED);
    }

}
