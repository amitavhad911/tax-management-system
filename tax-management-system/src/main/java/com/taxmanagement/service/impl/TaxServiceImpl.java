package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.TaxComputeRequestDTO;
import com.taxmanagement.dto.response.TaxRecordResponseDTO;
import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.entity.User;
import com.taxmanagement.exception.ResourceNotFoundException;
import com.taxmanagement.repository.TaxRecordRepository;
import com.taxmanagement.repository.UserRepository;
import com.taxmanagement.service.interfaces.TaxService;
import com.taxmanagement.util.TaxCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaxServiceImpl implements TaxService {

    private final TaxRecordRepository taxRecordRepository;
    private final UserRepository userRepository;

    @Override
    public TaxRecordResponseDTO computeAndSave(
            TaxComputeRequestDTO request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                request.getUserId()
                        )
                );

        // Prevent duplicate tax computation
        boolean alreadyExists =
                !taxRecordRepository
                        .findByUserIdAndFinancialYear(
                                request.getUserId(),
                                request.getFinancialYear()
                        )
                        .isEmpty();

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    "Tax record already exists for this user and financial year"
            );
        }

        BigDecimal deductions =
                request.getDeductions() != null
                        ? request.getDeductions()
                        : BigDecimal.ZERO;

        BigDecimal expenses =
                request.getExpenses() != null
                        ? request.getExpenses()
                        : BigDecimal.ZERO;

        /*
         * Tax calculation is delegated to TaxCalculator.
         *
         * Financial year and user type are passed dynamically.
         * Therefore, TaxServiceImpl does NOT hardcode
         * 2025-2026 or any particular financial year.
         */
        TaxCalculator.TaxResult result =
                TaxCalculator.calculate(
                        request.getGrossIncome(),
                        deductions,
                        expenses,
                        user.getUserType(),
                        request.getFinancialYear()
                );

        TaxRecord record = TaxRecord.builder()
                .financialYear(request.getFinancialYear())
                .grossIncome(request.getGrossIncome())
                .deductions(deductions)
                .expenses(expenses)
                .taxableIncome(result.taxableIncome())
                .incomeTax(result.incomeTax())
                .cess(result.cess())
                .taxRate(result.taxRate())
                .taxAmount(result.taxAmount())
                .user(user)
                .build();

        record = taxRecordRepository.save(record);

        return mapToDTO(record);
    }

    @Override
    @Transactional(readOnly = true)
    public TaxRecordResponseDTO getTaxRecordById(Long id) {

        TaxRecord record =
                taxRecordRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "TaxRecord",
                                        id
                                )
                        );

        return mapToDTO(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaxRecordResponseDTO> getTaxHistoryByUser(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(
                    "User",
                    userId
            );
        }

        return taxRecordRepository
                .findByUserIdOrderByFinancialYearDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaxRecordResponseDTO updateTaxRecord(
            Long id,
            TaxComputeRequestDTO request) {

        TaxRecord record =
                taxRecordRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "TaxRecord",
                                        id
                                )
                        );

        Long userId = record.getUser().getId();

        // Prevent duplicate financial-year record
        if (!record.getFinancialYear()
                .equals(request.getFinancialYear())) {

            boolean alreadyExists =
                    !taxRecordRepository
                            .findByUserIdAndFinancialYear(
                                    userId,
                                    request.getFinancialYear()
                            )
                            .isEmpty();

            if (alreadyExists) {
                throw new IllegalArgumentException(
                        "Tax record already exists for this user and financial year"
                );
            }
        }

        BigDecimal deductions =
                request.getDeductions() != null
                        ? request.getDeductions()
                        : BigDecimal.ZERO;

        BigDecimal expenses =
                request.getExpenses() != null
                        ? request.getExpenses()
                        : BigDecimal.ZERO;

        /*
         * Recalculate tax whenever income,
         * deductions, expenses or financial year changes.
         */
        TaxCalculator.TaxResult result =
                TaxCalculator.calculate(
                        request.getGrossIncome(),
                        deductions,
                        expenses,
                        record.getUser().getUserType(),
                        request.getFinancialYear()
                );

        record.setFinancialYear(request.getFinancialYear());
        record.setGrossIncome(request.getGrossIncome());
        record.setDeductions(deductions);
        record.setExpenses(expenses);

        record.setTaxableIncome(result.taxableIncome());
        record.setIncomeTax(result.incomeTax());
        record.setCess(result.cess());
        record.setTaxRate(result.taxRate());
        record.setTaxAmount(result.taxAmount());

        TaxRecord updated =
                taxRecordRepository.save(record);

        return mapToDTO(updated);
    }

    @Override
    public void deleteTaxRecord(Long id) {

        TaxRecord record =
                taxRecordRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "TaxRecord",
                                        id
                                )
                        );

        taxRecordRepository.delete(record);
    }

    private TaxRecordResponseDTO mapToDTO(
            TaxRecord record) {

        User user = record.getUser();

        return TaxRecordResponseDTO.builder()
                .id(record.getId())
                .financialYear(record.getFinancialYear())
                .grossIncome(record.getGrossIncome())
                .deductions(record.getDeductions())
                .expenses(record.getExpenses())
                .taxableIncome(record.getTaxableIncome())
                .incomeTax(record.getIncomeTax())
                .cess(record.getCess())
                .taxRate(record.getTaxRate())
                .taxAmount(record.getTaxAmount())
                .createdDate(record.getCreatedDate())
                .updatedDate(record.getUpdatedDate())
                .userId(user.getId())
                .userName(user.getFullName())
                .panNumber(user.getPanNumber())
                .build();
    }
}