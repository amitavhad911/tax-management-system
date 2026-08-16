package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminProfileResponseDTO {

    private Long id;

    private String username;

    private String role;

    private LocalDateTime createdAt;

    private Boolean active;
}