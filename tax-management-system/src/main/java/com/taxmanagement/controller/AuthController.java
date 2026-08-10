package com.taxmanagement.controller;

import com.taxmanagement.dto.request.LoginRequestDTO;
import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.dto.response.LoginResponseDTO;
import com.taxmanagement.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        String token = jwtUtil.generateToken(authentication.getName());
        LoginResponseDTO response = new LoginResponseDTO(token);
        return ResponseEntity.ok(
                ApiResponse.<LoginResponseDTO>builder().success(true).message("Login successful").data(response).build());
    }
}