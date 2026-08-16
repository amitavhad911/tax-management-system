package com.taxmanagement.config;

import com.taxmanagement.entity.*;
import com.taxmanagement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@Profile("!test")
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            TaxRecordRepository taxRepo,
            AdminRepository adminRepo) {

        return args -> {

            // -----------------------------------------
            // Create / update Admin
            // -----------------------------------------
            Admin admin = adminRepo.findByUsername("admin")
                    .orElseGet(() ->
                            Admin.builder()
                                    .username("admin")
                                    .role(Admin.Role.ADMIN)
                                    .build()
                    );

            admin.setPassword(
                    passwordEncoder.encode("Admin321")
            );

            adminRepo.save(admin);


            // -----------------------------------------
            // Create / get demo User
            // -----------------------------------------
            User user1 = userRepo
                    .findByPanNumber("ABCDE1234F")
                    .orElseGet(() -> {

                        User u = User.builder()
                                .fullName("John Doe")
                                .email("john@example.com")
                                .phoneNumber("9876543210")
                                .address("123 Main St")
                                .panNumber("ABCDE1234F")
                                .userType(User.UserType.INDIVIDUAL)
                                .build();

                        return userRepo.save(u);
                    });


            // -----------------------------------------
            // Create demo Tax Record
            // -----------------------------------------
            if (taxRepo.countByUserId(user1.getId()) == 0) {

                BigDecimal grossIncome =
                        new BigDecimal("750000");

                BigDecimal deductions =
                        new BigDecimal("150000");

                BigDecimal taxableIncome =
                        grossIncome.subtract(deductions);

                TaxRecord t1 = TaxRecord.builder()
                        .financialYear("2025-2026")
                        .grossIncome(grossIncome)
                        .deductions(deductions)
                        .expenses(BigDecimal.ZERO)
                        .taxableIncome(taxableIncome)
                        .incomeTax(BigDecimal.ZERO)
                        .taxRate(BigDecimal.ZERO)
                        .taxAmount(BigDecimal.ZERO)
                        .cess(BigDecimal.ZERO)
                        .user(user1)
                        .build();

                taxRepo.save(t1);
            }
        };
    }
}