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

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiAssistantServiceImpl implements AiAssistantService {

    private final TaxRecordRepository taxRecordRepository;
    private final UserRepository userRepository;

    @Override
    public AiExplainResponseDTO explainTax(Long taxRecordId) {

        TaxRecord record = taxRecordRepository.findById(taxRecordId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("TaxRecord", taxRecordId));

        String summary =
                "The tax liability for "
                        + record.getUser().getFullName()
                        + " in FY "
                        + record.getFinancialYear()
                        + " is ₹"
                        + record.getTaxAmount();

        String detail =
                "Gross income: ₹"
                        + record.getGrossIncome()
                        + "\nDeductions: ₹"
                        + record.getDeductions()
                        + "\nExpenses: ₹"
                        + record.getExpenses()
                        + "\nTaxable income: ₹"
                        + record.getTaxableIncome()
                        + "\nTax rate: "
                        + record.getTaxRate()
                        + "%"
                        + "\nIncome tax: ₹"
                        + record.getIncomeTax()
                        + "\nCess: ₹"
                        + record.getCess()
                        + "\nTotal tax liability: ₹"
                        + record.getTaxAmount();

        return AiExplainResponseDTO.builder()
                .summary(summary)
                .detailedExplanation(detail)
                .build();
    }

    @Override
    public AiSuggestionResponseDTO suggestDeductions() {

        return AiSuggestionResponseDTO.builder()
                .suggestion(
                        "For eligible taxpayers, consider deductions such as "
                                + "Section 80C investments, health insurance under "
                                + "Section 80D, and eligible NPS contributions under "
                                + "Section 80CCD(1B). Eligibility depends on the "
                                + "applicable tax regime and current tax rules."
                )
                .build();
    }

    @Override
    public AiAskResponseDTO askQuestion(AiAskRequestDTO request) {

        String q = request.getQuestion().toLowerCase();

        String answer;

        if (q.contains("deduction")) {

            answer =
                    "Deductions may be available under sections such as "
                            + "80C, 80D, 80E and 80G, subject to eligibility "
                            + "and the applicable tax regime.";

        } else if (q.contains("slab")
                || q.contains("tax rate")
                || q.contains("tax rates")) {

            answer =
                    "For FY 2025-2026 under the new tax regime:\n"
                            + "₹0 - ₹4,00,000 → Nil\n"
                            + "₹4,00,001 - ₹8,00,000 → 5%\n"
                            + "₹8,00,001 - ₹12,00,000 → 10%\n"
                            + "₹12,00,001 - ₹16,00,000 → 15%\n"
                            + "₹16,00,001 - ₹20,00,000 → 20%\n"
                            + "₹20,00,001 - ₹24,00,000 → 25%\n"
                            + "Above ₹24,00,000 → 30%\n\n"
                            + "A 4% Health & Education Cess is added "
                            + "to the calculated income tax.";

        } else if (q.contains("pan")) {

            answer =
                    "PAN (Permanent Account Number) is a 10-character "
                            + "alphanumeric identifier issued by the "
                            + "Income Tax Department.";

        } else {

            answer =
                    "I can help with tax slabs, taxable income, "
                            + "deductions, PAN information and tax "
                            + "computation-related questions.";
        }

        return AiAskResponseDTO.builder()
                .answer(answer)
                .build();
    }

    @Override
    public AiSummaryResponseDTO summarizeUserHistory(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User", userId));

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

        StringBuilder sb = new StringBuilder();

        sb.append("Tax history for ")
                .append(user.getFullName())
                .append(":\n\n");

        for (TaxRecord record : records) {

            sb.append("Financial Year: ")
                    .append(record.getFinancialYear())
                    .append("\n");

            sb.append("Gross Income: ₹")
                    .append(record.getGrossIncome())
                    .append("\n");

            sb.append("Deductions: ₹")
                    .append(record.getDeductions())
                    .append("\n");

            sb.append("Expenses: ₹")
                    .append(record.getExpenses())
                    .append("\n");

            sb.append("Taxable Income: ₹")
                    .append(record.getTaxableIncome())
                    .append("\n");

            sb.append("Tax Rate: ")
                    .append(record.getTaxRate())
                    .append("%\n");

            sb.append("Tax Liability: ₹")
                    .append(record.getTaxAmount())
                    .append("\n\n");
        }

        return AiSummaryResponseDTO.builder()
                .summary(sb.toString())
                .build();
    }
}