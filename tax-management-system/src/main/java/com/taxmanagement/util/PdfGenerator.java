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
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Tax Records Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.addCell("ID");
            table.addCell("User");
            table.addCell("Financial Year");
            table.addCell("Tax Amount");

            List<TaxRecord> records = taxRecordRepository.findAll();
            for (TaxRecord r : records) {
                table.addCell(String.valueOf(r.getId()));
                table.addCell(r.getUser().getFullName());
                table.addCell(r.getFinancialYear());
                table.addCell(r.getTaxAmount().toString());
            }
            document.add(table);
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }
}