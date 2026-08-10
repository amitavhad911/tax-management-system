package com.taxmanagement.controller;

import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.dto.response.DashboardResponseDTO;
import com.taxmanagement.dto.response.SummaryResponseDTO;
import com.taxmanagement.dto.response.TopTaxpayerResponseDTO;
import com.taxmanagement.service.interfaces.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponseDTO>> getDashboard() {
        return ResponseEntity.ok(
                ApiResponse.<DashboardResponseDTO>builder().success(true).data(reportService.getDashboard()).build());
    }

    @GetMapping("/top-taxpayers")
    public ResponseEntity<ApiResponse<List<TopTaxpayerResponseDTO>>> getTopTaxpayers(
            @RequestParam(defaultValue = "5") int n) {
        return ResponseEntity.ok(
                ApiResponse.<List<TopTaxpayerResponseDTO>>builder().success(true).data(reportService.getTopTaxpayers(n)).build());
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryResponseDTO>> getSummary() {
        return ResponseEntity.ok(
                ApiResponse.<SummaryResponseDTO>builder().success(true).data(reportService.getSummary()).build());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdf = reportService.exportToPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tax_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] excel = reportService.exportToExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tax_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }
}