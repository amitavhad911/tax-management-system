package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.UserRequestDTO;
import com.taxmanagement.dto.response.UserResponseDTO;
import com.taxmanagement.entity.User;
import com.taxmanagement.exception.DuplicatePanException;
import com.taxmanagement.exception.ResourceNotFoundException;
import com.taxmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRequestDTO request;
    private User user;

    @BeforeEach
    void setUp() {
        request = new UserRequestDTO();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPhoneNumber("9876543210");
        request.setAddress("456 Avenue");
        request.setPanNumber("ABCDE1234F");
        request.setUserType(User.UserType.INDIVIDUAL);

        user = User.builder()
                .id(1L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .phoneNumber("9876543210")
                .address("456 Avenue")
                .panNumber("ABCDE1234F")
                .userType(User.UserType.INDIVIDUAL)
                .build();
    }

    @Test
    void createUser_ShouldReturnDTO_WhenValidRequest() {
        when(userRepository.existsByPanNumber(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponseDTO dto = userService.createUser(request);

        assertThat(dto).isNotNull();
        assertThat(dto.getFullName()).isEqualTo("Jane Doe");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowDuplicatePanException_WhenPanExists() {
        when(userRepository.existsByPanNumber(anyString())).thenReturn(true);
        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(DuplicatePanException.class)
                .hasMessageContaining("ABCDE1234F");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_ShouldReturnUser_WhenFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        UserResponseDTO dto = userService.getUserById(1L);
        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getFullName()).isEqualTo("Jane Doe");
    }

    @Test
    void getUserById_ShouldThrowException_WhenNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.getUserById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteUser_ShouldThrowException_WhenNotFound() {
        when(userRepository.existsById(1L)).thenReturn(false);
        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(userRepository, never()).deleteById(anyLong());
    }
}