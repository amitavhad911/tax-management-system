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
@Profile("!test")   // ← Skip this initializer in the 'test' profile
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo,
                                   TaxRecordRepository taxRepo,
                                   AdminRepository adminRepo) {
        return args -> {
            Admin admin = adminRepo.findByUsername("admin").orElseGet(() ->
                Admin.builder().username("admin").role(Admin.Role.ADMIN).build());
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminRepo.save(admin);

            User user1 = userRepo.findByPanNumber("ABCDE1234F").orElseGet(() -> {
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

            if (taxRepo.countByUserId(user1.getId()) == 0) {
                TaxRecord t1 = TaxRecord.builder()
                        .financialYear("2025-2026")
                        .grossIncome(new BigDecimal("750000"))
                        .deductions(new BigDecimal("150000"))
                        .expenses(BigDecimal.ZERO)
                        .user(user1)
                        .build();
                taxRepo.save(t1);
            }
        };
    }
}