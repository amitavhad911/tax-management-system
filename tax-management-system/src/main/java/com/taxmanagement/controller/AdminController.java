package com.taxmanagement.controller;

import com.taxmanagement.dto.request.ChangePasswordRequestDTO;
import com.taxmanagement.dto.request.UpdateAdminProfileRequestDTO;
import com.taxmanagement.dto.response.AdminProfileResponseDTO;
import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.service.interfaces.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AdminProfileResponseDTO>> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                ApiResponse.<AdminProfileResponseDTO>builder()
                        .success(true)
                        .message("Profile retrieved successfully")
                        .data(
                                adminService.getProfile(
                                        authentication.getName()
                                )
                        )
                        .build()
        );
    }


    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AdminProfileResponseDTO>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequestDTO request
    ) {

        return ResponseEntity.ok(
                ApiResponse.<AdminProfileResponseDTO>builder()
                        .success(true)
                        .message("Profile updated successfully")
                        .data(
                                adminService.updateProfile(
                                        authentication.getName(),
                                        request
                                )
                        )
                        .build()
        );
    }


    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request
    ) {

        adminService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Password changed successfully")
                        .build()
        );
    }
}