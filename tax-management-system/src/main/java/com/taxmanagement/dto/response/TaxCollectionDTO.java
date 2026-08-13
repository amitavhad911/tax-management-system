package com.taxmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TaxCollectionDTO {

    private String financialYear;

    private BigDecimal taxAmount;
}