package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.AiAskRequestDTO;
import com.taxmanagement.dto.response.*;
import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.entity.User;
import com.taxmanagement.exception.ResourceNotFoundException;
import com.taxmanagement.repository.TaxRecordRepository;
import com.taxmanagement.repository.UserRepository;
import com.taxmanagement.service.interfaces.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiAssistantServiceImpl implements AiAssistantService {

    private final TaxRecordRepository taxRecordRepository;
    private final UserRepository userRepository;


    // =========================================================
    // EXPLAIN TAX RECORD
    // =========================================================

    @Override
    public AiExplainResponseDTO explainTax(Long taxRecordId) {

        TaxRecord record = taxRecordRepository.findById(taxRecordId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("TaxRecord", taxRecordId));

        String userName = record.getUser().getFullName();

        String summary =
                "The tax liability for "
                        + userName
                        + " in FY "
                        + record.getFinancialYear()
                        + " is ₹"
                        + money(record.getTaxAmount())
                        + ".";

        String detail =
                "Taxpayer: "
                        + userName
                        + "\n"
                        + "Taxpayer ID: "
                        + record.getUser().getId()
                        + "\n"
                        + "PAN: "
                        + safe(record.getUser().getPanNumber())
                        + "\n"
                        + "Taxpayer Type: "
                        + record.getUser().getUserType()
                        + "\n\n"

                        + "Financial Year: "
                        + record.getFinancialYear()
                        + "\n"
                        + "Gross Income: ₹"
                        + money(record.getGrossIncome())
                        + "\n"
                        + "Deductions: ₹"
                        + money(record.getDeductions())
                        + "\n"
                        + "Expenses: ₹"
                        + money(record.getExpenses())
                        + "\n"
                        + "Taxable Income: ₹"
                        + money(record.getTaxableIncome())
                        + "\n"
                        + "Income Tax: ₹"
                        + money(record.getIncomeTax())
                        + "\n"
                        + "Cess: ₹"
                        + money(record.getCess())
                        + "\n"
                        + "Effective Tax Rate: "
                        + money(record.getTaxRate())
                        + "%"
                        + "\n"
                        + "Final Tax Liability: ₹"
                        + money(record.getTaxAmount());

        return AiExplainResponseDTO.builder()
                .summary(summary)
                .detailedExplanation(detail)
                .build();
    }


    // =========================================================
    // TAXPAYER-SPECIFIC DEDUCTIONS
    // =========================================================

    @Override
    public AiSuggestionResponseDTO suggestDeductions(Long userId) {

        User user = getUser(userId);

        List<TaxRecord> records =
                taxRecordRepository.findByUserIdOrderByFinancialYearDesc(userId);

        if (records.isEmpty()) {

            return AiSuggestionResponseDTO.builder()
                    .suggestion(
                            "No completed tax computation was found for "
                                    + user.getFullName()
                                    + ". Add a tax computation first so "
                                    + "tax-specific suggestions can be generated."
                    )
                    .build();
        }

        TaxRecord latest = records.get(0);

        StringBuilder suggestion = new StringBuilder();

        suggestion.append("Taxpayer: ")
                .append(user.getFullName())
                .append("\n");

        suggestion.append("Taxpayer Type: ")
                .append(user.getUserType())
                .append("\n");

        suggestion.append("Financial Year: ")
                .append(latest.getFinancialYear())
                .append("\n\n");

        suggestion.append("Current tax information:\n");

        suggestion.append("Gross Income: ₹")
                .append(money(latest.getGrossIncome()))
                .append("\n");

        suggestion.append("Current Deductions: ₹")
                .append(money(latest.getDeductions()))
                .append("\n");

        suggestion.append("Taxable Income: ₹")
                .append(money(latest.getTaxableIncome()))
                .append("\n");

        suggestion.append("Tax Liability: ₹")
                .append(money(latest.getTaxAmount()))
                .append("\n\n");

        if (user.getUserType() == User.UserType.INDIVIDUAL) {

            suggestion.append(
                    "For an individual taxpayer, potentially relevant "
                            + "deductions may include eligible investments "
                            + "under applicable sections such as 80C, "
                            + "eligible health insurance under 80D, and "
                            + "eligible NPS contributions. Actual eligibility "
                            + "depends on the applicable tax regime and "
                            + "financial-year rules."
            );

        } else {

            suggestion.append(
                    "This taxpayer is classified as institutional. "
                            + "Individual deductions such as personal "
                            + "80C/80D deductions should not automatically "
                            + "be applied. Institutional tax treatment "
                            + "depends on the organization's applicable "
                            + "tax rules and category."
            );
        }

        return AiSuggestionResponseDTO.builder()
                .suggestion(suggestion.toString())
                .build();
    }


    // =========================================================
    // ASK QUESTION
    // =========================================================

    @Override
    public AiAskResponseDTO askQuestion(AiAskRequestDTO request) {

        User user = getUser(request.getUserId());

        List<TaxRecord> records =
                taxRecordRepository.findByUserIdOrderByFinancialYearDesc(
                        user.getId()
                );

        String q = request.getQuestion()
                .trim()
                .toLowerCase();

        if (q.isEmpty()) {
            return answer(
                    "Please enter a tax-related question."
            );
        }


        // =====================================================
        // NO TAX DATA
        // =====================================================

        if (records.isEmpty()
                && !containsAny(q, "pan", "name", "type", "taxpayer")) {

            return answer(
                    "No completed tax computation is available for "
                            + user.getFullName()
                            + ". Please create a tax computation first "
                            + "before asking questions about income, "
                            + "tax liability, deductions or tax history."
            );
        }


        TaxRecord latest =
                records.isEmpty() ? null : records.get(0);


        // =====================================================
        // TAXPAYER INFORMATION
        // =====================================================

        if (containsAny(q,
                "who am i",
                "my name",
                "taxpayer name",
                "taxpayer information",
                "my information")) {

            String answer =
                    "Taxpayer Information\n\n"
                            + "Name: "
                            + user.getFullName()
                            + "\n"
                            + "Taxpayer ID: "
                            + user.getId()
                            + "\n"
                            + "PAN: "
                            + safe(user.getPanNumber())
                            + "\n"
                            + "Taxpayer Type: "
                            + user.getUserType();

            return answer(answer);
        }


        // =====================================================
        // PAN
        // =====================================================

        if (containsAny(q, "pan", "pan number")) {

            return answer(
                    "The PAN registered for "
                            + user.getFullName()
                            + " is "
                            + safe(user.getPanNumber())
                            + "."
            );
        }


        // =====================================================
        // GROSS INCOME
        // =====================================================

        if (containsAny(q,
                "gross income",
                "total income",
                "my income",
                "income")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "For "
                            + user.getFullName()
                            + ", the gross income in the latest "
                            + "computation for FY "
                            + latest.getFinancialYear()
                            + " is ₹"
                            + money(latest.getGrossIncome())
                            + "."
            );
        }


        // =====================================================
        // DEDUCTIONS
        // =====================================================

        if (containsAny(q,
                "deduction",
                "deductions",
                "deducted")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The deductions recorded for "
                            + user.getFullName()
                            + " in FY "
                            + latest.getFinancialYear()
                            + " are ₹"
                            + money(latest.getDeductions())
                            + "."
            );
        }


        // =====================================================
        // EXPENSES
        // =====================================================

        if (containsAny(q,
                "expense",
                "expenses",
                "spending")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The expenses recorded for "
                            + user.getFullName()
                            + " in FY "
                            + latest.getFinancialYear()
                            + " are ₹"
                            + money(latest.getExpenses())
                            + "."
            );
        }


        // =====================================================
        // TAXABLE INCOME
        // =====================================================

        if (containsAny(q,
                "taxable income",
                "taxable")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The taxable income for "
                            + user.getFullName()
                            + " in FY "
                            + latest.getFinancialYear()
                            + " is ₹"
                            + money(latest.getTaxableIncome())
                            + "."
            );
        }


        // =====================================================
        // TAX LIABILITY
        // =====================================================

        if (containsAny(q,
                "tax liability",
                "tax payable",
                "how much tax",
                "total tax",
                "tax amount")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The latest tax liability for "
                            + user.getFullName()
                            + " is ₹"
                            + money(latest.getTaxAmount())
                            + " for FY "
                            + latest.getFinancialYear()
                            + "."
            );
        }


        // =====================================================
        // TAX RATE
        // =====================================================

        if (containsAny(q,
                "tax rate",
                "effective rate",
                "rate")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The effective tax rate recorded for "
                            + user.getFullName()
                            + " in FY "
                            + latest.getFinancialYear()
                            + " is "
                            + money(latest.getTaxRate())
                            + "%."
            );
        }


        // =====================================================
        // CESS
        // =====================================================

        if (containsAny(q,
                "cess",
                "health and education cess",
                "health education cess")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The Health & Education Cess recorded in the latest "
                            + "tax computation is ₹"
                            + money(latest.getCess())
                            + "."
            );
        }


        // =====================================================
        // INCOME TAX BEFORE CESS
        // =====================================================

        if (containsAny(q,
                "income tax",
                "tax before cess")) {

            if (latest == null) {
                return answer(
                        "No tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            return answer(
                    "The income tax before cess for "
                            + user.getFullName()
                            + " is ₹"
                            + money(latest.getIncomeTax())
                            + " for FY "
                            + latest.getFinancialYear()
                            + "."
            );
        }


        // =====================================================
        // LATEST TAX COMPUTATION
        // =====================================================

        if (containsAny(q,
                "latest computation",
                "latest tax",
                "latest calculation",
                "explain my tax",
                "tax calculation")) {

            if (latest == null) {
                return answer(
                        "No completed tax computation is available for "
                                + user.getFullName()
                                + "."
                );
            }

            String result =
                    "Latest Tax Computation\n\n"
                            + "Taxpayer: "
                            + user.getFullName()
                            + "\n"
                            + "Financial Year: "
                            + latest.getFinancialYear()
                            + "\n"
                            + "Gross Income: ₹"
                            + money(latest.getGrossIncome())
                            + "\n"
                            + "Deductions: ₹"
                            + money(latest.getDeductions())
                            + "\n"
                            + "Expenses: ₹"
                            + money(latest.getExpenses())
                            + "\n"
                            + "Taxable Income: ₹"
                            + money(latest.getTaxableIncome())
                            + "\n"
                            + "Income Tax: ₹"
                            + money(latest.getIncomeTax())
                            + "\n"
                            + "Cess: ₹"
                            + money(latest.getCess())
                            + "\n"
                            + "Tax Rate: "
                            + money(latest.getTaxRate())
                            + "%\n"
                            + "Final Tax Liability: ₹"
                            + money(latest.getTaxAmount());

            return answer(result);
        }


        // =====================================================
        // TAX HISTORY
        // =====================================================

        if (containsAny(q,
                "history",
                "previous years",
                "previous year",
                "past tax",
                "tax history")) {

            return answer(buildHistorySummary(user, records));
        }


        // =====================================================
        // COMPARE YEARS
        // =====================================================

        if (containsAny(q,
                "compare",
                "difference",
                "increased",
                "decreased",
                "change")) {

            return answer(buildComparison(records, user));
        }


        // =====================================================
        // TAX SLABS
        // =====================================================

        if (containsAny(q,
                "slab",
                "tax slabs",
                "tax rate",
                "tax rates")) {

            if (user.getUserType() == User.UserType.INSTITUTIONAL) {

                return answer(
                        "The selected taxpayer is classified as "
                                + "INSTITUTIONAL. Individual income-tax "
                                + "slabs should not be applied to this "
                                + "taxpayer. Institutional tax treatment "
                                + "depends on the applicable company or "
                                + "institutional tax rules."
                );
            }

            return answer(
                    "Based on the tax slab rules currently configured "
                            + "in this project for FY 2025-2026 under "
                            + "the new tax regime:\n\n"
                            + "₹0 - ₹4,00,000 → Nil\n"
                            + "₹4,00,001 - ₹8,00,000 → 5%\n"
                            + "₹8,00,001 - ₹12,00,000 → 10%\n"
                            + "₹12,00,001 - ₹16,00,000 → 15%\n"
                            + "₹16,00,001 - ₹20,00,000 → 20%\n"
                            + "₹20,00,001 - ₹24,00,000 → 25%\n"
                            + "Above ₹24,00,000 → 30%\n\n"
                            + "A 4% Health & Education Cess is added "
                            + "to the calculated income tax."
            );
        }


        // =====================================================
        // DEFAULT
        // =====================================================

        return answer(
                "I don't have enough information in the Tax Management "
                        + "System to answer that question accurately.\n\n"
                        + "I can currently answer questions about "
                        + user.getFullName()
                        + "'s income, deductions, expenses, taxable income, "
                        + "tax rate, cess, tax liability, tax history, "
                        + "latest computation, PAN and taxpayer type."
        );
    }


    // =========================================================
    // SUMMARIZE USER HISTORY
    // =========================================================

    @Override
    public AiSummaryResponseDTO summarizeUserHistory(Long userId) {

        User user = getUser(userId);

        List<TaxRecord> records =
                taxRecordRepository
                        .findByUserIdOrderByFinancialYearDesc(userId);

        if (records.isEmpty()) {

            return AiSummaryResponseDTO.builder()
                    .summary(
                            "No tax records found for "
                                    + user.getFullName()
                    )
                    .build();
        }

        return AiSummaryResponseDTO.builder()
                .summary(buildHistorySummary(user, records))
                .build();
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private User getUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", userId));
    }


    private AiAskResponseDTO answer(String text) {

        return AiAskResponseDTO.builder()
                .answer(text)
                .build();
    }


    private boolean containsAny(String text, String... values) {

        for (String value : values) {

            if (text.contains(value)) {
                return true;
            }
        }

        return false;
    }


    private String safe(String value) {

        return value == null || value.isBlank()
                ? "Not available"
                : value;
    }


    private String money(BigDecimal value) {

        return value == null
                ? "0.00"
                : value.toPlainString();
    }


    private String buildHistorySummary(
            User user,
            List<TaxRecord> records) {

        StringBuilder sb = new StringBuilder();

        sb.append("Tax history for ")
                .append(user.getFullName())
                .append("\n\n");

        sb.append("Taxpayer ID: ")
                .append(user.getId())
                .append("\n");

        sb.append("PAN: ")
                .append(safe(user.getPanNumber()))
                .append("\n");

        sb.append("Taxpayer Type: ")
                .append(user.getUserType())
                .append("\n\n");

        for (TaxRecord record : records) {

            sb.append("Financial Year: ")
                    .append(record.getFinancialYear())
                    .append("\n");

            sb.append("Gross Income: ₹")
                    .append(money(record.getGrossIncome()))
                    .append("\n");

            sb.append("Deductions: ₹")
                    .append(money(record.getDeductions()))
                    .append("\n");

            sb.append("Expenses: ₹")
                    .append(money(record.getExpenses()))
                    .append("\n");

            sb.append("Taxable Income: ₹")
                    .append(money(record.getTaxableIncome()))
                    .append("\n");

            sb.append("Tax Rate: ")
                    .append(money(record.getTaxRate()))
                    .append("%\n");

            sb.append("Income Tax: ₹")
                    .append(money(record.getIncomeTax()))
                    .append("\n");

            sb.append("Cess: ₹")
                    .append(money(record.getCess()))
                    .append("\n");

            sb.append("Tax Liability: ₹")
                    .append(money(record.getTaxAmount()))
                    .append("\n\n");
        }

        return sb.toString();
    }


    private String buildComparison(
            List<TaxRecord> records,
            User user) {

        if (records.size() < 2) {

            return "Only one completed tax computation is available "
                    + "for "
                    + user.getFullName()
                    + ". At least two financial years are required "
                    + "for a year-to-year comparison.";
        }

        TaxRecord current = records.get(0);
        TaxRecord previous = records.get(1);

        BigDecimal incomeChange =
                safeValue(current.getGrossIncome())
                        .subtract(safeValue(previous.getGrossIncome()));

        BigDecimal taxableChange =
                safeValue(current.getTaxableIncome())
                        .subtract(safeValue(previous.getTaxableIncome()));

        BigDecimal taxChange =
                safeValue(current.getTaxAmount())
                        .subtract(safeValue(previous.getTaxAmount()));

        return "Tax Comparison for "
                + user.getFullName()
                + "\n\n"

                + current.getFinancialYear()
                + " vs "
                + previous.getFinancialYear()
                + "\n\n"

                + "Gross Income Change: ₹"
                + money(incomeChange)
                + "\n"

                + "Taxable Income Change: ₹"
                + money(taxableChange)
                + "\n"

                + "Tax Liability Change: ₹"
                + money(taxChange)
                + "\n\n"

                + "Positive values indicate an increase compared "
                + "with the previous available financial year.";
    }


    private BigDecimal safeValue(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}