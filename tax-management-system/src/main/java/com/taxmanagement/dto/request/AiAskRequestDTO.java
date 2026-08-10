package com.taxmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiAskRequestDTO {
    @NotBlank
    private String question;
}