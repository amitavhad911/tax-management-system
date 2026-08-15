package com.taxmanagement.service.interfaces;

import com.taxmanagement.dto.request.TaxComputeRequestDTO;
import com.taxmanagement.dto.response.TaxRecordResponseDTO;

import java.util.List;

public interface TaxService {

    TaxRecordResponseDTO computeAndSave(
            TaxComputeRequestDTO request
    );

    TaxRecordResponseDTO getTaxRecordById(
            Long id
    );

    /*
     * Get all completed tax computations
     * across all taxpayers.
     */
    List<TaxRecordResponseDTO> getAllTaxHistory();

    /*
     * Get tax history for one taxpayer.
     */
    List<TaxRecordResponseDTO> getTaxHistoryByUser(
            Long userId
    );

    TaxRecordResponseDTO updateTaxRecord(
            Long id,
            TaxComputeRequestDTO request
    );

    void deleteTaxRecord(
            Long id
    );
}