package com.taxmanagement.controller;

import com.taxmanagement.dto.request.TaxComputeRequestDTO;
import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.dto.response.TaxRecordResponseDTO;
import com.taxmanagement.service.interfaces.TaxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax")
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    @PostMapping("/compute")
    public ResponseEntity<ApiResponse<TaxRecordResponseDTO>> compute(@Valid @RequestBody TaxComputeRequestDTO request) {
        TaxRecordResponseDTO result = taxService.computeAndSave(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<TaxRecordResponseDTO>builder().success(true).message("Tax computed").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRecordResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<TaxRecordResponseDTO>builder().success(true).data(taxService.getTaxRecordById(id)).build());
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<List<TaxRecordResponseDTO>>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.<List<TaxRecordResponseDTO>>builder().success(true).data(taxService.getTaxHistoryByUser(userId)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRecordResponseDTO>> update(@PathVariable Long id, @Valid @RequestBody TaxComputeRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.<TaxRecordResponseDTO>builder().success(true).data(taxService.updateTaxRecord(id, request)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taxService.deleteTaxRecord(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Tax record deleted").build());
    }
}
