package com.taxmanagement.service.interfaces;

import com.taxmanagement.dto.response.DashboardResponseDTO;
import com.taxmanagement.dto.response.SummaryResponseDTO;
import com.taxmanagement.dto.response.TopTaxpayerResponseDTO;

import java.util.List;

public interface ReportService {
    DashboardResponseDTO getDashboard();
    List<TopTaxpayerResponseDTO> getTopTaxpayers(int n);
    SummaryResponseDTO getSummary();
    byte[] exportToPdf();
    byte[] exportToExcel();
}