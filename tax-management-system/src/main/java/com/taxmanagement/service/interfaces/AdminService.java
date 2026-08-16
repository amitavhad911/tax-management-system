package com.taxmanagement.service.interfaces;

import com.taxmanagement.dto.request.ChangePasswordRequestDTO;
import com.taxmanagement.dto.request.UpdateAdminProfileRequestDTO;
import com.taxmanagement.dto.response.AdminProfileResponseDTO;

public interface AdminService {

    AdminProfileResponseDTO getProfile(String username);

    AdminProfileResponseDTO updateProfile(
            String currentUsername,
            UpdateAdminProfileRequestDTO request
    );

    void changePassword(
            String username,
            ChangePasswordRequestDTO request
    );
}