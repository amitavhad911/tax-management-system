package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class SummaryResponseDTO {
    private long totalRecords;
    private BigDecimal totalTaxCollected;
    private BigDecimal averageTaxAmount;
}