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

        // =========================
        // HEADER
        // =========================

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("User");
        header.createCell(2).setCellValue("PAN");
        header.createCell(3).setCellValue("Taxpayer Type");
        header.createCell(4).setCellValue("Financial Year");
        header.createCell(5).setCellValue("Gross Income");
        header.createCell(6).setCellValue("Deductions");
        header.createCell(7).setCellValue("Expenses");
        header.createCell(8).setCellValue("Taxable Income");
        header.createCell(9).setCellValue("Income Tax");
        header.createCell(10).setCellValue("Cess");
        header.createCell(11).setCellValue("Tax Rate (%)");
        header.createCell(12).setCellValue("Tax Liability");

        // =========================
        // HEADER STYLE
        // =========================

        CellStyle headerStyle = workbook.createCellStyle();

        Font headerFont = workbook.createFont();
        headerFont.setBold(true);

        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(
                HorizontalAlignment.CENTER
        );

        for (int i = 0; i <= 12; i++) {
            header.getCell(i).setCellStyle(headerStyle);
        }

        // =========================
        // DATA
        // =========================

        List<TaxRecord> records =
                taxRecordRepository.findAll();

        int rowNum = 1;

        for (TaxRecord r : records) {

            Row row = sheet.createRow(rowNum++);

            row.createCell(0)
                    .setCellValue(r.getId());

            row.createCell(1)
                    .setCellValue(
                            r.getUser().getFullName()
                    );

            row.createCell(2)
                    .setCellValue(
                            r.getUser().getPanNumber()
                    );

            row.createCell(3)
                    .setCellValue(
                            r.getUser().getUserType().name()
                    );

            row.createCell(4)
                    .setCellValue(
                            r.getFinancialYear()
                    );

            row.createCell(5)
                    .setCellValue(
                            r.getGrossIncome().doubleValue()
                    );

            row.createCell(6)
                    .setCellValue(
                            r.getDeductions().doubleValue()
                    );

            row.createCell(7)
                    .setCellValue(
                            r.getExpenses().doubleValue()
                    );

            row.createCell(8)
                    .setCellValue(
                            r.getTaxableIncome().doubleValue()
                    );

            row.createCell(9)
                    .setCellValue(
                            r.getIncomeTax().doubleValue()
                    );

            row.createCell(10)
                    .setCellValue(
                            r.getCess().doubleValue()
                    );

            row.createCell(11)
                    .setCellValue(
                            r.getTaxRate().doubleValue()
                    );

            row.createCell(12)
                    .setCellValue(
                            r.getTaxAmount().doubleValue()
                    );
        }

        // =========================
        // AUTO SIZE COLUMNS
        // =========================

        for (int i = 0; i <= 12; i++) {
            sheet.autoSizeColumn(i);
        }

        // =========================
        // GENERATE FILE
        // =========================

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        try {

            workbook.write(out);
            workbook.close();

            return out.toByteArray();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Error generating Excel",
                    e
            );
        }
    }
}