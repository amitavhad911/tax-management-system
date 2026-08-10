package com.taxmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TaxRecordResponseDTO {

    private Long id;

    private String financialYear;

    private BigDecimal grossIncome;

    private BigDecimal deductions;

    private BigDecimal expenses;

    private BigDecimal taxableIncome;

    // Tax before cess
    private BigDecimal incomeTax;

    // 4% Health & Education Cess
    private BigDecimal cess;

    // Effective tax rate including cess
    private BigDecimal taxRate;

    // Final tax liability = incomeTax + cess
    private BigDecimal taxAmount;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    private Long userId;

    private String userName;

    private String panNumber;
}