package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AiSummaryResponseDTO {
    private String summary;
}