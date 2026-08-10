package com.taxmanagement;

import com.taxmanagement.config.DataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TaxManagementApplicationTests {

    @Test
    void contextLoads() {
        // The application context should start successfully
    }
}