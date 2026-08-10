package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class DashboardResponseDTO {
    private long totalUsers;
    private long individualCount;
    private long institutionalCount;
    private BigDecimal totalTaxCollected;
    private TopTaxpayerResponseDTO highestTaxpayer;
}