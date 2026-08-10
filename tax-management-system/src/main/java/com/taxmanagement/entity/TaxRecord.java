package com.taxmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tax_records",
        indexes = {
                @Index(
                        name = "idx_tax_user_fy",
                        columnList = "user_id, financial_year"
                ),
                @Index(
                        name = "idx_tax_amount",
                        columnList = "tax_amount"
                ),
                @Index(
                        name = "idx_tax_created_date",
                        columnList = "created_date"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "financial_year",
            nullable = false,
            length = 9
    )
    private String financialYear;

    @Column(
            name = "gross_income",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal grossIncome;

    @Column(
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal expenses = BigDecimal.ZERO;

    @Column(
            name = "taxable_income",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal taxableIncome;

    /*
     * Tax before 4% Health & Education Cess
     */
    @Column(
            name = "income_tax",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal incomeTax = BigDecimal.ZERO;

    /*
     * Health & Education Cess
     */
    @Column(
            name = "cess",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal cess = BigDecimal.ZERO;

    /*
     * Effective tax rate including cess
     */
    @Column(
            name = "tax_rate",
            nullable = false,
            precision = 7,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    /*
     * Final tax liability = income tax + cess
     */
    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(
            name = "created_date",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdDate;

    @Column(
            name = "updated_date",
            nullable = false
    )
    private LocalDateTime updatedDate;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_tax_user")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdDate = now;
        updatedDate = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}