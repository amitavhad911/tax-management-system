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

    // =========================================================
    // USER TAX RECORDS
    // =========================================================

    List<TaxRecord> findByUserIdOrderByFinancialYearDesc(
            Long userId
    );

    List<TaxRecord> findByUserIdAndFinancialYear(
            Long userId,
            String financialYear
    );


    // =========================================================
    // ALL COMPLETED TAX HISTORY
    // =========================================================
    /*
     * Every TaxRecord represents a completed/saved
     * tax computation.
     *
     * Fetch the associated User so the service can return:
     * - userId
     * - userName
     * - PAN
     * - userType
     */
    @Query("""
            SELECT t
            FROM TaxRecord t
            JOIN FETCH t.user
            ORDER BY t.financialYear DESC, t.createdDate DESC
            """)
    List<TaxRecord> findAllTaxHistory();


    // =========================================================
    // TOTAL TAX - ALL FINANCIAL YEARS
    // =========================================================

    @Query("""
            SELECT COALESCE(SUM(t.taxAmount), 0)
            FROM TaxRecord t
            """)
    BigDecimal getTotalTaxCollected();


    // =========================================================
    // TOTAL TAX - SPECIFIC FINANCIAL YEAR
    // =========================================================

    @Query("""
            SELECT COALESCE(SUM(t.taxAmount), 0)
            FROM TaxRecord t
            WHERE t.financialYear = :financialYear
            """)
    BigDecimal getTotalTaxCollectedByFinancialYear(
            @Param("financialYear") String financialYear
    );


    // =========================================================
    // TAX COLLECTION - FINANCIAL YEAR WISE
    // =========================================================

    @Query("""
            SELECT t.financialYear, COALESCE(SUM(t.taxAmount), 0)
            FROM TaxRecord t
            GROUP BY t.financialYear
            ORDER BY t.financialYear
            """)
    List<Object[]> getTaxCollectionByFinancialYear();


    // =========================================================
    // AVERAGE TAX - ALL FINANCIAL YEARS
    // =========================================================

    @Query("""
            SELECT COALESCE(AVG(t.taxAmount), 0)
            FROM TaxRecord t
            """)
    BigDecimal getAverageTaxAmount();


    // =========================================================
    // AVERAGE TAX - SPECIFIC FINANCIAL YEAR
    // =========================================================

    @Query("""
            SELECT COALESCE(AVG(t.taxAmount), 0)
            FROM TaxRecord t
            WHERE t.financialYear = :financialYear
            """)
    BigDecimal getAverageTaxAmountByFinancialYear(
            @Param("financialYear") String financialYear
    );


    // =========================================================
    // TOP TAXPAYERS - ALL RECORDS
    // =========================================================

    @Query("""
            SELECT t
            FROM TaxRecord t
            ORDER BY t.taxAmount DESC
            """)
    List<TaxRecord> findTopTaxPayers(
            Pageable pageable
    );


    // =========================================================
    // TOP TAXPAYERS - SPECIFIC FINANCIAL YEAR
    // =========================================================

    @Query("""
            SELECT t
            FROM TaxRecord t
            WHERE t.financialYear = :financialYear
            ORDER BY t.taxAmount DESC
            """)
    List<TaxRecord> findTopTaxPayersByFinancialYear(
            @Param("financialYear") String financialYear,
            Pageable pageable
    );


    // =========================================================
    // USER RECORD COUNT
    // =========================================================

    @Query("""
            SELECT COUNT(t)
            FROM TaxRecord t
            WHERE t.user.id = :userId
            """)
    long countByUserId(
            @Param("userId") Long userId
    );


    // =========================================================
    // RECORD COUNT - SPECIFIC FINANCIAL YEAR
    // =========================================================

    @Query("""
            SELECT COUNT(t)
            FROM TaxRecord t
            WHERE t.financialYear = :financialYear
            """)
    long countByFinancialYear(
            @Param("financialYear") String financialYear
    );
}