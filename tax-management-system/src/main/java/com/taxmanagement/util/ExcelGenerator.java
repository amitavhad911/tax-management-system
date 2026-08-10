package com.taxmanagement.util;

import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.repository.TaxRecordRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ExcelGenerator {

    private final TaxRecordRepository taxRecordRepository;

    public byte[] generateTaxReport() {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Tax Records");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("User");
        header.createCell(2).setCellValue("Financial Year");
        header.createCell(3).setCellValue("Tax Amount");

        List<TaxRecord> records = taxRecordRepository.findAll();
        int rowNum = 1;
        for (TaxRecord r : records) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(r.getId());
            row.createCell(1).setCellValue(r.getUser().getFullName());
            row.createCell(2).setCellValue(r.getFinancialYear());
            row.createCell(3).setCellValue(r.getTaxAmount().doubleValue());
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            workbook.write(out);
            workbook.close();
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }
}