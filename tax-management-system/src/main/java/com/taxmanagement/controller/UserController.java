package com.taxmanagement.controller;

import com.taxmanagement.dto.request.UserRequestDTO;
import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.dto.response.UserResponseDTO;
import com.taxmanagement.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponseDTO>> create(@Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO dto = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserResponseDTO>builder().success(true).message("User created").data(dto).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponseDTO>builder().success(true).data(userService.getUserById(id)).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.<Page<UserResponseDTO>>builder().success(true).data(userService.getAllUsers(pageable)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> update(@PathVariable Long id, @Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponseDTO>builder().success(true).data(userService.updateUser(id, request)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("User deleted").build());
    }
}
