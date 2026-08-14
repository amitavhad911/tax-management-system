package com.taxmanagement.util;

import com.taxmanagement.entity.User;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculator {

    private static final BigDecimal CESS_RATE =
            new BigDecimal("0.04");

    private static final BigDecimal INSTITUTIONAL_TAX_RATE =
            new BigDecimal("0.25");

    public static TaxResult calculate(
            BigDecimal grossIncome,
            BigDecimal deductions,
            BigDecimal expenses,
            User.UserType userType,
            String financialYear) {

        // =====================================================
        // NULL SAFETY
        // =====================================================

        if (grossIncome == null) {
            grossIncome = BigDecimal.ZERO;
        }

        if (deductions == null) {
            deductions = BigDecimal.ZERO;
        }

        if (expenses == null) {
            expenses = BigDecimal.ZERO;
        }

        if (userType == null) {
            throw new IllegalArgumentException(
                    "User type is required"
            );
        }

        if (financialYear == null ||
                !financialYear.matches("^\\d{4}-\\d{4}$")) {

            throw new IllegalArgumentException(
                    "Financial year must be in YYYY-YYYY format"
            );
        }

        // =====================================================
        // TAXABLE INCOME
        // =====================================================

        /*
         * Taxable Income
         * = Gross Income - Deductions - Expenses
         */

        BigDecimal taxableIncome =
                grossIncome
                        .subtract(deductions)
                        .subtract(expenses);

        // Taxable income cannot be negative
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        taxableIncome =
                taxableIncome.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal incomeTax;

        // =====================================================
        // INDIVIDUAL vs INSTITUTIONAL
        // =====================================================

        if (userType == User.UserType.INSTITUTIONAL) {

            /*
             * =================================================
             * INSTITUTIONAL TAX
             * =================================================
             *
             * Project rule:
             * Institutional taxpayer → 25% flat tax
             *
             * This is intentionally different from
             * Individual slab-based taxation.
             */

            incomeTax =
                    taxableIncome
                            .multiply(INSTITUTIONAL_TAX_RATE)
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );

        } else {

            /*
             * =================================================
             * INDIVIDUAL TAX
             * =================================================
             *
             * Individual taxation uses financial-year-specific
             * slabs.
             */

            incomeTax =
                    calculateIndividualTax(
                            taxableIncome,
                            financialYear
                    );
        }

        // =====================================================
        // HEALTH & EDUCATION CESS
        // =====================================================

        BigDecimal cess =
                incomeTax
                        .multiply(CESS_RATE)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // =====================================================
        // FINAL TAX LIABILITY
        // =====================================================

        BigDecimal taxAmount =
                incomeTax
                        .add(cess)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // =====================================================
        // EFFECTIVE TAX RATE
        // =====================================================

        BigDecimal taxRate;

        if (taxableIncome.compareTo(BigDecimal.ZERO) == 0) {

            taxRate = BigDecimal.ZERO;

        } else {

            taxRate =
                    taxAmount
                            .divide(
                                    taxableIncome,
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    new BigDecimal("100")
                            )
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        return new TaxResult(
                taxableIncome,
                incomeTax,
                cess,
                taxRate,
                taxAmount
        );
    }

    // =========================================================
    // INDIVIDUAL TAX CALCULATION
    // =========================================================

    private static BigDecimal calculateIndividualTax(
            BigDecimal income,
            String financialYear) {

        switch (financialYear) {

            case "2023-2024":
                return calculateFY2023_24(income);

            case "2024-2025":
                return calculateFY2024_25(income);

            case "2025-2026":
                return calculateFY2025_26(income);

            default:
                throw new IllegalArgumentException(
                        "Tax slabs are not configured for financial year "
                                + financialYear
                                + ". Please add the applicable statutory slabs before calculating tax for this year."
                );
        }
    }

    // =========================================================
    // FY 2023-2024
    // NEW TAX REGIME
    // =========================================================

    private static BigDecimal calculateFY2023_24(
            BigDecimal income) {

        BigDecimal tax;

        /*
         * FY 2023-24 New Regime
         *
         * Up to 3L          → 0%
         * 3L - 6L           → 5%
         * 6L - 9L           → 10%
         * 9L - 12L          → 15%
         * 12L - 15L         → 20%
         * Above 15L         → 30%
         */

        if (income.compareTo(
                new BigDecimal("300000")) <= 0) {

            tax = BigDecimal.ZERO;

        } else if (income.compareTo(
                new BigDecimal("600000")) <= 0) {

            tax =
                    income
                            .subtract(
                                    new BigDecimal("300000")
                            )
                            .multiply(
                                    new BigDecimal("0.05")
                            );

        } else if (income.compareTo(
                new BigDecimal("900000")) <= 0) {

            tax =
                    new BigDecimal("15000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("600000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.10")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("1200000")) <= 0) {

            tax =
                    new BigDecimal("45000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("900000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.15")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("1500000")) <= 0) {

            tax =
                    new BigDecimal("90000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1200000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.20")
                                            )
                            );

        } else {

            tax =
                    new BigDecimal("150000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1500000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.30")
                                            )
                            );
        }

        /*
         * Section 87A rebate.
         *
         * For the project calculation, tax is zero
         * for taxable income up to ₹7 lakh.
         */

        if (income.compareTo(
                new BigDecimal("700000")) <= 0) {

            tax = BigDecimal.ZERO;
        }

        return tax.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    // =========================================================
    // FY 2024-2025
    // NEW TAX REGIME
    // =========================================================

    private static BigDecimal calculateFY2024_25(
            BigDecimal income) {

        BigDecimal tax;

        /*
         * FY 2024-25 New Regime
         *
         * Up to 3L          → 0%
         * 3L - 7L           → 5%
         * 7L - 10L          → 10%
         * 10L - 12L         → 15%
         * 12L - 15L         → 20%
         * Above 15L         → 30%
         */

        if (income.compareTo(
                new BigDecimal("300000")) <= 0) {

            tax = BigDecimal.ZERO;

        } else if (income.compareTo(
                new BigDecimal("700000")) <= 0) {

            tax =
                    income
                            .subtract(
                                    new BigDecimal("300000")
                            )
                            .multiply(
                                    new BigDecimal("0.05")
                            );

        } else if (income.compareTo(
                new BigDecimal("1000000")) <= 0) {

            tax =
                    new BigDecimal("20000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("700000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.10")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("1200000")) <= 0) {

            tax =
                    new BigDecimal("50000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1000000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.15")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("1500000")) <= 0) {

            tax =
                    new BigDecimal("80000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1200000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.20")
                                            )
                            );

        } else {

            tax =
                    new BigDecimal("140000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1500000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.30")
                                            )
                            );
        }

        /*
         * Section 87A rebate for FY 2024-25.
         */

        if (income.compareTo(
                new BigDecimal("700000")) <= 0) {

            tax = BigDecimal.ZERO;
        }

        return tax.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    // =========================================================
    // FY 2025-2026
    // NEW TAX REGIME
    // =========================================================

    private static BigDecimal calculateFY2025_26(
            BigDecimal income) {

        BigDecimal tax;

        /*
         * FY 2025-26 New Regime
         *
         * Up to 4L          → 0%
         * 4L - 8L           → 5%
         * 8L - 12L          → 10%
         * 12L - 16L         → 15%
         * 16L - 20L         → 20%
         * 20L - 24L         → 25%
         * Above 24L         → 30%
         */

        if (income.compareTo(
                new BigDecimal("400000")) <= 0) {

            tax = BigDecimal.ZERO;

        } else if (income.compareTo(
                new BigDecimal("800000")) <= 0) {

            tax =
                    income
                            .subtract(
                                    new BigDecimal("400000")
                            )
                            .multiply(
                                    new BigDecimal("0.05")
                            );

        } else if (income.compareTo(
                new BigDecimal("1200000")) <= 0) {

            tax =
                    new BigDecimal("20000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("800000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.10")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("1600000")) <= 0) {

            tax =
                    new BigDecimal("60000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1200000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.15")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("2000000")) <= 0) {

            tax =
                    new BigDecimal("120000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("1600000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.20")
                                            )
                            );

        } else if (income.compareTo(
                new BigDecimal("2400000")) <= 0) {

            tax =
                    new BigDecimal("200000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("2000000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.25")
                                            )
                            );

        } else {

            tax =
                    new BigDecimal("300000")
                            .add(
                                    income
                                            .subtract(
                                                    new BigDecimal("2400000")
                                            )
                                            .multiply(
                                                    new BigDecimal("0.30")
                                            )
                            );
        }

        /*
         * Section 87A rebate.
         *
         * FY 2025-26:
         * Taxable income up to ₹12 lakh
         * → rebate up to ₹60,000.
         */

        if (income.compareTo(
                new BigDecimal("1200000")) <= 0) {

            tax = BigDecimal.ZERO;
        }

        return tax.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    // =========================================================
    // RESULT
    // =========================================================

    public record TaxResult(
            BigDecimal taxableIncome,
            BigDecimal incomeTax,
            BigDecimal cess,
            BigDecimal taxRate,
            BigDecimal taxAmount
    ) {
    }
}