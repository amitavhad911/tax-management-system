package com.taxmanagement.service.interfaces;

import com.taxmanagement.dto.request.AiAskRequestDTO;
import com.taxmanagement.dto.response.*;

public interface AiAssistantService {

    AiExplainResponseDTO explainTax(Long taxRecordId);

    AiSuggestionResponseDTO suggestDeductions(Long userId);

    AiAskResponseDTO askQuestion(AiAskRequestDTO request);

    AiSummaryResponseDTO summarizeUserHistory(Long userId);
}