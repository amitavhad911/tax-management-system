package com.taxmanagement.service.impl;

import com.taxmanagement.dto.request.TaxComputeRequestDTO;
import com.taxmanagement.dto.response.TaxRecordResponseDTO;
import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.entity.User;
import com.taxmanagement.exception.ResourceNotFoundException;
import com.taxmanagement.repository.TaxRecordRepository;
import com.taxmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxServiceImplTest {

    @Mock
    private TaxRecordRepository taxRecordRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaxServiceImpl taxService;

    private TaxComputeRequestDTO request;
    private User user;

    @BeforeEach
    void setUp() {
        request = new TaxComputeRequestDTO();
        request.setUserId(1L);
        request.setFinancialYear("2025-2026");
        request.setGrossIncome(new BigDecimal("750000"));
        request.setDeductions(new BigDecimal("150000"));
        request.setExpenses(BigDecimal.ZERO);

        user = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .phoneNumber("1234567890")
                .panNumber("AAAAA0000A")
                .userType(User.UserType.INDIVIDUAL)
                .build();
    }

    @Test
    void computeAndSave_ShouldReturnTaxRecord() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        TaxRecord savedRecord = TaxRecord.builder()
                .id(1L)
                .financialYear("2025-2026")
                .grossIncome(new BigDecimal("750000"))
                .deductions(new BigDecimal("150000"))
                .expenses(BigDecimal.ZERO)
                .taxableIncome(new BigDecimal("600000"))
                .taxRate(new BigDecimal("20.00"))
                .taxAmount(new BigDecimal("32500.00"))
                .user(user)
                .build();
        when(taxRecordRepository.save(any(TaxRecord.class))).thenReturn(savedRecord);

        TaxRecordResponseDTO dto = taxService.computeAndSave(request);

        assertThat(dto).isNotNull();
        assertThat(dto.getTaxAmount()).isEqualByComparingTo("32500.00");
        assertThat(dto.getUserId()).isEqualTo(1L);
        verify(taxRecordRepository).save(any(TaxRecord.class));
    }

    @Test
    void computeAndSave_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> taxService.computeAndSave(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(taxRecordRepository, never()).save(any(TaxRecord.class));
    }
}