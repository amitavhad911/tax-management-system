package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AiExplainResponseDTO {
    private String summary;
    private String detailedExplanation;
}