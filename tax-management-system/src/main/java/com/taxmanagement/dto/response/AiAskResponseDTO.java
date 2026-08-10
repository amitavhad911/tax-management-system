package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AiAskResponseDTO {
    private String answer;
}