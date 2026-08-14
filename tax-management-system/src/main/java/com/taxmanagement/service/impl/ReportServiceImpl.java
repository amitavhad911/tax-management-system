package com.taxmanagement.service.impl;

import com.taxmanagement.dto.response.DashboardResponseDTO;
import com.taxmanagement.dto.response.SummaryResponseDTO;
import com.taxmanagement.dto.response.TaxCollectionDTO;
import com.taxmanagement.dto.response.TopTaxpayerResponseDTO;
import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.entity.User;
import com.taxmanagement.repository.TaxRecordRepository;
import com.taxmanagement.repository.UserRepository;
import com.taxmanagement.service.interfaces.ReportService;
import com.taxmanagement.util.ExcelGenerator;
import com.taxmanagement.util.PdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final TaxRecordRepository taxRecordRepository;
    private final PdfGenerator pdfGenerator;
    private final ExcelGenerator excelGenerator;

    @Override
    public DashboardResponseDTO getDashboard() {

        long individualCount =
                userRepository.countByUserType(User.UserType.INDIVIDUAL);

        long institutionalCount =
                userRepository.countByUserType(User.UserType.INSTITUTIONAL);

        long totalUsers = individualCount + institutionalCount;

        BigDecimal totalTax =
                taxRecordRepository.getTotalTaxCollected();

        if (totalTax == null) {
            totalTax = BigDecimal.ZERO;
        }

        // =====================================================
        // FINANCIAL YEAR-WISE TAX COLLECTION
        // =====================================================

        List<TaxCollectionDTO> taxCollectionByFinancialYear =
                taxRecordRepository.getTaxCollectionByFinancialYear()
                        .stream()
                        .map(row -> new TaxCollectionDTO(
                                (String) row[0],
                                (BigDecimal) row[1]
                        ))
                        .collect(Collectors.toList());

        // =====================================================
        // HIGHEST TAXPAYER
        // =====================================================

        TopTaxpayerResponseDTO highest = null;

        List<TaxRecord> topList =
                taxRecordRepository.findTopTaxPayers(
                        PageRequest.of(0, 1)
                );

        if (!topList.isEmpty()) {

            TaxRecord top = topList.get(0);

            highest = TopTaxpayerResponseDTO.builder()
                    .rank(1)
                    .userId(top.getUser().getId())
                    .userName(top.getUser().getFullName())
                    .panNumber(top.getUser().getPanNumber())

                    // Taxpayer type
                    .userType(top.getUser().getUserType())

                    .taxAmount(top.getTaxAmount())
                    .build();
        }

        // =====================================================
        // DASHBOARD RESPONSE
        // =====================================================

        return DashboardResponseDTO.builder()
                .totalUsers(totalUsers)
                .individualCount(individualCount)
                .institutionalCount(institutionalCount)
                .totalTaxCollected(totalTax)
                .highestTaxpayer(highest)
                .taxCollectionByFinancialYear(
                        taxCollectionByFinancialYear
                )
                .build();
    }

    @Override
    public List<TopTaxpayerResponseDTO> getTopTaxpayers(int n) {

        if (n <= 0) {
            n = 5;
        }

        n = Math.min(n, 50);

        List<TaxRecord> top =
                taxRecordRepository.findTopTaxPayers(
                        PageRequest.of(0, n)
                );

        return IntStream.range(0, top.size())
                .mapToObj(i -> {

                    TaxRecord t = top.get(i);

                    return TopTaxpayerResponseDTO.builder()
                            .rank(i + 1)
                            .userId(t.getUser().getId())
                            .userName(t.getUser().getFullName())
                            .panNumber(t.getUser().getPanNumber())

                            // Taxpayer type
                            .userType(t.getUser().getUserType())

                            .taxAmount(t.getTaxAmount())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public SummaryResponseDTO getSummary() {

        long totalRecords =
                taxRecordRepository.count();

        BigDecimal totalTax =
                taxRecordRepository.getTotalTaxCollected();

        if (totalTax == null) {
            totalTax = BigDecimal.ZERO;
        }

        BigDecimal avgTax =
                taxRecordRepository.getAverageTaxAmount();

        if (avgTax == null) {
            avgTax = BigDecimal.ZERO;
        }

        return SummaryResponseDTO.builder()
                .totalRecords(totalRecords)
                .totalTaxCollected(totalTax)
                .averageTaxAmount(avgTax)
                .build();
    }

    @Override
    public byte[] exportToPdf() {
        return pdfGenerator.generateTaxReport();
    }

    @Override
    public byte[] exportToExcel() {
        return excelGenerator.generateTaxReport();
    }
}