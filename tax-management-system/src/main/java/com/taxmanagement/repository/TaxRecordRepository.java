package com.taxmanagement.repository;

import com.taxmanagement.entity.TaxRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TaxRecordRepository
        extends JpaRepository<TaxRecord, Long> {

    List<TaxRecord> findByUserIdOrderByFinancialYearDesc(
            Long userId
    );

    List<TaxRecord> findByUserIdAndFinancialYear(
            Long userId,
            String financialYear
    );

    @Query("""
            SELECT COALESCE(SUM(t.taxAmount), 0)
            FROM TaxRecord t
            """)
    BigDecimal getTotalTaxCollected();

    @Query("""
            SELECT COALESCE(AVG(t.taxAmount), 0)
            FROM TaxRecord t
            """)
    BigDecimal getAverageTaxAmount();

    /*
     * Returns tax records ordered by tax amount.
     *
     * NOTE:
     * This is still record-based, not user-aggregated.
     * Keep this if your dashboard means the highest
     * single tax computation.
     */
    @Query("""
            SELECT t
            FROM TaxRecord t
            ORDER BY t.taxAmount DESC
            """)
    List<TaxRecord> findTopTaxPayers(
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(t)
            FROM TaxRecord t
            WHERE t.user.id = :userId
            """)
    long countByUserId(
            @Param("userId") Long userId
    );
}