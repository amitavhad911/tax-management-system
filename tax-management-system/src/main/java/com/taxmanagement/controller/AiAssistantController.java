package com.taxmanagement.controller;

import com.taxmanagement.dto.request.AiAskRequestDTO;
import com.taxmanagement.dto.response.*;
import com.taxmanagement.service.interfaces.AiAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/explain-tax/{taxRecordId}")
    public ResponseEntity<ApiResponse<AiExplainResponseDTO>> explainTax(@PathVariable Long taxRecordId) {
        return ResponseEntity.ok(
                ApiResponse.<AiExplainResponseDTO>builder().success(true)
                        .data(aiAssistantService.explainTax(taxRecordId)).build());
    }

    @PostMapping("/suggest-deductions")
    public ResponseEntity<ApiResponse<AiSuggestionResponseDTO>> suggestDeductions() {
        return ResponseEntity.ok(
                ApiResponse.<AiSuggestionResponseDTO>builder().success(true)
                        .data(aiAssistantService.suggestDeductions()).build());
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AiAskResponseDTO>> ask(@Valid @RequestBody AiAskRequestDTO request) {
        return ResponseEntity.ok(
                ApiResponse.<AiAskResponseDTO>builder().success(true)
                        .data(aiAssistantService.askQuestion(request)).build());
    }

    @PostMapping("/summarize/{userId}")
    public ResponseEntity<ApiResponse<AiSummaryResponseDTO>> summarize(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.<AiSummaryResponseDTO>builder().success(true)
                        .data(aiAssistantService.summarizeUserHistory(userId)).build());
    }
}