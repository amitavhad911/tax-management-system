package com.taxmanagement.util;

import com.taxmanagement.entity.User;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculator {

    private static final BigDecimal CESS_RATE = new BigDecimal("0.04");

    public static TaxResult calculate(
            BigDecimal grossIncome,
            BigDecimal deductions,
            BigDecimal expenses,
            User.UserType userType,
            String financialYear) {

        // Prevent null values
        if (grossIncome == null) {
            grossIncome = BigDecimal.ZERO;
        }

        if (deductions == null) {
            deductions = BigDecimal.ZERO;
        }

        if (expenses == null) {
            expenses = BigDecimal.ZERO;
        }

        /*
         * Taxable Income
         * = Gross Income - Deductions - Expenses
         */
        BigDecimal taxableIncome = grossIncome
                .subtract(deductions)
                .subtract(expenses);

        // Taxable income cannot be negative
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        taxableIncome = taxableIncome.setScale(2, RoundingMode.HALF_UP);

        BigDecimal incomeTax;
        BigDecimal cess;

        /*
         * Institutional taxpayer
         * Flat 25% tax
         */
        if (userType == User.UserType.INSTITUTIONAL) {

            incomeTax = taxableIncome
                    .multiply(new BigDecimal("0.25"))
                    .setScale(2, RoundingMode.HALF_UP);

        } else {

            /*
             * Individual taxpayer
             * New Tax Regime - FY 2025-2026
             */
            incomeTax = calculateNewRegimeTax(
                    taxableIncome,
                    financialYear
            );
        }

        /*
         * 4% Health & Education Cess
         */
        cess = incomeTax
                .multiply(CESS_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        /*
         * Final Tax Liability
         * = Income Tax + Cess
         */
        BigDecimal taxAmount = incomeTax
                .add(cess)
                .setScale(2, RoundingMode.HALF_UP);

        /*
         * Effective Tax Rate
         */
        BigDecimal taxRate;

        if (taxableIncome.compareTo(BigDecimal.ZERO) == 0) {

            taxRate = BigDecimal.ZERO;

        } else {

            taxRate = taxAmount
                    .divide(
                            taxableIncome,
                            4,
                            RoundingMode.HALF_UP
                    )
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new TaxResult(
                taxableIncome,
                incomeTax,
                cess,
                taxRate,
                taxAmount
        );
    }

    private static BigDecimal calculateNewRegimeTax(
            BigDecimal income,
            String financialYear) {

        if (!"2025-2026".equals(financialYear)) {
            throw new IllegalArgumentException(
                    "New tax regime calculation is currently supported only for FY 2025-2026"
            );
        }

        BigDecimal tax;

        // ₹0 - ₹4,00,000 → 0%
        if (income.compareTo(new BigDecimal("400000")) <= 0) {

            tax = BigDecimal.ZERO;

        // ₹4,00,001 - ₹8,00,000 → 5%
        } else if (income.compareTo(new BigDecimal("800000")) <= 0) {

            tax = income
                    .subtract(new BigDecimal("400000"))
                    .multiply(new BigDecimal("0.05"));

        // ₹8,00,001 - ₹12,00,000 → 10%
        } else if (income.compareTo(new BigDecimal("1200000")) <= 0) {

            tax = new BigDecimal("20000")
                    .add(
                            income.subtract(new BigDecimal("800000"))
                                    .multiply(new BigDecimal("0.10"))
                    );

        // ₹12,00,001 - ₹16,00,000 → 15%
        } else if (income.compareTo(new BigDecimal("1600000")) <= 0) {

            tax = new BigDecimal("60000")
                    .add(
                            income.subtract(new BigDecimal("1200000"))
                                    .multiply(new BigDecimal("0.15"))
                    );

        // ₹16,00,001 - ₹20,00,000 → 20%
        } else if (income.compareTo(new BigDecimal("2000000")) <= 0) {

            tax = new BigDecimal("120000")
                    .add(
                            income.subtract(new BigDecimal("1600000"))
                                    .multiply(new BigDecimal("0.20"))
                    );

        // ₹20,00,001 - ₹24,00,000 → 25%
        } else if (income.compareTo(new BigDecimal("2400000")) <= 0) {

            tax = new BigDecimal("200000")
                    .add(
                            income.subtract(new BigDecimal("2000000"))
                                    .multiply(new BigDecimal("0.25"))
                    );

        // Above ₹24,00,000 → 30%
        } else {

            tax = new BigDecimal("300000")
                    .add(
                            income.subtract(new BigDecimal("2400000"))
                                    .multiply(new BigDecimal("0.30"))
                    );
        }

        /*
         * Section 87A Rebate
         */
        if (income.compareTo(new BigDecimal("1200000")) <= 0) {
            tax = BigDecimal.ZERO;
        }

        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    public record TaxResult(
            BigDecimal taxableIncome,
            BigDecimal incomeTax,
            BigDecimal cess,
            BigDecimal taxRate,
            BigDecimal taxAmount
    ) {
    }
}