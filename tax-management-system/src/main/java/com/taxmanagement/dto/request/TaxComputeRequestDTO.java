package com.taxmanagement.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaxComputeRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Financial year is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{4}$",
            message = "Financial year must be in YYYY-YYYY format"
    )
    private String financialYear;

    @NotNull(message = "Gross income is required")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Gross income must be positive"
    )
    private BigDecimal grossIncome;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Deductions cannot be negative"
    )
    private BigDecimal deductions = BigDecimal.ZERO;

    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Expenses cannot be negative"
    )
    private BigDecimal expenses = BigDecimal.ZERO;
}