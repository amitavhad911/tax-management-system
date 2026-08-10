package com.taxmanagement.service.interfaces;

import com.taxmanagement.dto.request.TaxComputeRequestDTO;
import com.taxmanagement.dto.response.TaxRecordResponseDTO;
import java.util.List;

public interface TaxService {
    TaxRecordResponseDTO computeAndSave(TaxComputeRequestDTO request);
    TaxRecordResponseDTO getTaxRecordById(Long id);
    List<TaxRecordResponseDTO> getTaxHistoryByUser(Long userId);
    TaxRecordResponseDTO updateTaxRecord(Long id, TaxComputeRequestDTO request);
    void deleteTaxRecord(Long id);
}
