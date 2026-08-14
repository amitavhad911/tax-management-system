package com.taxmanagement.util;

import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.repository.TaxRecordRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PdfGenerator {

    private final TaxRecordRepository taxRecordRepository;

    public byte[] generateTaxReport() {

        Document document =
                new Document(
                        PageSize.A4.rotate(),
                        20,
                        20,
                        20,
                        20
                );

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        try {

            PdfWriter.getInstance(
                    document,
                    out
            );

            document.open();

            // =========================
            // TITLE
            // =========================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            18
                    );

            Paragraph title =
                    new Paragraph(
                            "Tax Records Report",
                            titleFont
                    );

            title.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(title);

            document.add(Chunk.NEWLINE);

            // =========================
            // TABLE
            // =========================

            PdfPTable table =
                    new PdfPTable(10);

            table.setWidthPercentage(100);

            table.setWidths(
                    new float[]{
                            0.5f,
                            1.4f,
                            1.1f,
                            1.0f,
                            1.0f,
                            1.2f,
                            1.2f,
                            1.2f,
                            1.2f,
                            1.3f
                    }
            );

            table.addCell("ID");
            table.addCell("User");
            table.addCell("PAN");
            table.addCell("Type");
            table.addCell("Financial Year");
            table.addCell("Gross Income");
            table.addCell("Taxable Income");
            table.addCell("Income Tax");
            table.addCell("Cess");
            table.addCell("Tax Liability");

            // =========================
            // DATA
            // =========================

            List<TaxRecord> records =
                    taxRecordRepository.findAll();

            for (TaxRecord r : records) {

                table.addCell(
                        String.valueOf(r.getId())
                );

                table.addCell(
                        r.getUser().getFullName()
                );

                table.addCell(
                        r.getUser().getPanNumber()
                );

                table.addCell(
                        r.getUser()
                                .getUserType()
                                .name()
                );

                table.addCell(
                        r.getFinancialYear()
                );

                table.addCell(
                        r.getGrossIncome()
                                .toString()
                );

                table.addCell(
                        r.getTaxableIncome()
                                .toString()
                );

                table.addCell(
                        r.getIncomeTax()
                                .toString()
                );

                table.addCell(
                        r.getCess()
                                .toString()
                );

                table.addCell(
                        r.getTaxAmount()
                                .toString()
                );
            }

            document.add(table);

        } catch (DocumentException e) {

            throw new RuntimeException(
                    "Error generating PDF",
                    e
            );

        } finally {

            document.close();
        }

        return out.toByteArray();
    }
}