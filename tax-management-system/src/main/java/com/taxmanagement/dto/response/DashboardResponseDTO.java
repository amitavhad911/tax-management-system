package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponseDTO {

    private long totalUsers;

    private long individualCount;

    private long institutionalCount;

    private BigDecimal totalTaxCollected;

    private TopTaxpayerResponseDTO highestTaxpayer;

    private List<TaxCollectionDTO> taxCollectionByFinancialYear;
}