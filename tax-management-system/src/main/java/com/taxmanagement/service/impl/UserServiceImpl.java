package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.UserRequestDTO;
import com.taxmanagement.dto.response.UserResponseDTO;
import com.taxmanagement.entity.User;
import com.taxmanagement.exception.DuplicatePanException;
import com.taxmanagement.exception.ResourceNotFoundException;
import com.taxmanagement.repository.UserRepository;
import com.taxmanagement.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponseDTO createUser(UserRequestDTO request) {

        if (userRepository.existsByPanNumber(request.getPanNumber())) {
            throw new DuplicatePanException(
                    request.getPanNumber()
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicatePanException(
                    "Email " + request.getEmail() + " already exists"
            );
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .panNumber(request.getPanNumber())
                .userType(request.getUserType())
                .active(true)
                .build();

        user = userRepository.save(user);

        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", id)
                );

        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {

        return userRepository
                .findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public UserResponseDTO updateUser(
            Long id,
            UserRequestDTO request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", id)
                );

        // Check duplicate PAN
        if (!user.getPanNumber().equals(request.getPanNumber())
                && userRepository.existsByPanNumber(
                        request.getPanNumber()
                )) {

            throw new DuplicatePanException(
                    request.getPanNumber()
            );
        }

        // Check duplicate Email
        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(
                        request.getEmail()
                )) {

            throw new DuplicatePanException(
                    "Email " + request.getEmail() +
                    " already exists"
            );
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setPanNumber(request.getPanNumber());
        user.setUserType(request.getUserType());

        return mapToDTO(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }

        userRepository.deleteById(id);
    }

    private UserResponseDTO mapToDTO(User user) {

        return UserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .panNumber(user.getPanNumber())
                .userType(user.getUserType())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}