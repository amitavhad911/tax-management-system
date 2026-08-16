package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.ChangePasswordRequestDTO;
import com.taxmanagement.dto.request.UpdateAdminProfileRequestDTO;
import com.taxmanagement.dto.response.AdminProfileResponseDTO;
import com.taxmanagement.entity.Admin;
import com.taxmanagement.repository.AdminRepository;
import com.taxmanagement.service.interfaces.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public AdminProfileResponseDTO getProfile(String username) {

        Admin admin = findAdmin(username);

        return mapToDTO(admin);
    }

    @Override
    public AdminProfileResponseDTO updateProfile(
            String currentUsername,
            UpdateAdminProfileRequestDTO request
    ) {

        Admin admin = findAdmin(currentUsername);

        String newUsername = request.getUsername().trim();

        if (!admin.getUsername().equals(newUsername)
                && adminRepository.existsByUsername(newUsername)) {

            throw new IllegalArgumentException(
                    "Username " + newUsername + " already exists"
            );
        }

        admin.setUsername(newUsername);

        Admin savedAdmin = adminRepository.save(admin);

        return mapToDTO(savedAdmin);
    }

    @Override
    public void changePassword(
            String username,
            ChangePasswordRequestDTO request
    ) {

        Admin admin = findAdmin(username);

        if (!request.getNewPassword().equals(
                request.getConfirmPassword()
        )) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match"
            );
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                admin.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                admin.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }

        admin.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        adminRepository.save(admin);
    }

    private Admin findAdmin(String username) {

        return adminRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admin with username '"
                                        + username
                                        + "' not found"
                        )
                );
    }

    private AdminProfileResponseDTO mapToDTO(Admin admin) {

        return AdminProfileResponseDTO.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .role(admin.getRole().name())
                .createdAt(admin.getCreatedAt())
                .active(true)
                .build();
    }
}