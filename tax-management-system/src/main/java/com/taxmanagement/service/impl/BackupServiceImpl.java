package com.taxmanagement.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxmanagement.entity.Admin;
import com.taxmanagement.entity.AuditLog;
import com.taxmanagement.entity.TaxRecord;
import com.taxmanagement.entity.User;
import com.taxmanagement.repository.AdminRepository;
import com.taxmanagement.repository.AuditLogRepository;
import com.taxmanagement.repository.TaxRecordRepository;
import com.taxmanagement.repository.UserRepository;
import com.taxmanagement.service.interfaces.BackupService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BackupServiceImpl implements BackupService {

    private final UserRepository userRepo;
    private final TaxRecordRepository taxRepo;
    private final AdminRepository adminRepo;
    private final AuditLogRepository auditLogRepo;

    private final ObjectMapper objectMapper;

    // =========================================================
    // EXPORT
    // =========================================================

    @Override
    public byte[] exportData(String format) throws IOException {

        String normalizedFormat =
                normalizeFormat(format);

        switch (normalizedFormat) {

            case "json":
                return exportJson();

            case "csv":
                return exportCsv();

            case "xlsx":
                return exportExcel();

            case "pdf":
                return exportPdf();

            default:
                throw new IllegalArgumentException(
                        "Unsupported backup format: " + format
                );
        }
    }

    // =========================================================
    // RESTORE
    // =========================================================

    @Override
    public void restoreData(
            byte[] fileData,
            String format
    ) throws IOException {

        String normalizedFormat =
                normalizeFormat(format);

        switch (normalizedFormat) {

            case "json":
                restoreFromJson(fileData);
                break;

            case "csv":
                restoreFromCsv(fileData);
                break;

            case "xlsx":
                restoreFromExcel(fileData);
                break;

            case "pdf":
                throw new IllegalArgumentException(
                        "PDF backups are export-only and cannot be used to restore database data."
                );

            default:
                throw new IllegalArgumentException(
                        "Unsupported restore format: " + format
                );
        }
    }

    // =========================================================
    // JSON EXPORT
    // =========================================================

    private byte[] exportJson() throws IOException {

        BackupData data =
                new BackupData(
                        userRepo.findAll(),
                        taxRepo.findAll(),
                        adminRepo.findAll(),
                        auditLogRepo.findAll()
                );

        return objectMapper
                .writerWithDefaultPrettyPrinter()
                .writeValueAsBytes(data);
    }

    // =========================================================
    // CSV EXPORT
    // =========================================================

    /*
     * CSV contains one backup record per line:
     *
     * entityType,data
     *
     * The second column contains the complete entity as JSON.
     *
     * This keeps CSV a structured backup format while preserving
     * all fields instead of exporting users only.
     */
    private byte[] exportCsv() throws IOException {

        StringBuilder sb = new StringBuilder();

        sb.append("entityType,data\n");

        for (User user : userRepo.findAll()) {
            appendCsvBackupRow(
                    sb,
                    "USER",
                    user
            );
        }

        for (TaxRecord taxRecord : taxRepo.findAll()) {

            Map<String, Object> map =
                    objectMapper.convertValue(
                            taxRecord,
                            new TypeReference<Map<String, Object>>() {}
                    );

            /*
             * Prevent duplicating the complete User object.
             * TaxRecord -> User is represented by userId.
             */
            map.remove("user");

            if (taxRecord.getUser() != null) {
                map.put(
                        "userId",
                        taxRecord.getUser().getId()
                );
            }

            appendCsvBackupRow(
                    sb,
                    "TAX_RECORD",
                    map
            );
        }

        for (Admin admin : adminRepo.findAll()) {
            appendCsvBackupRow(
                    sb,
                    "ADMIN",
                    admin
            );
        }

        for (AuditLog auditLog : auditLogRepo.findAll()) {
            appendCsvBackupRow(
                    sb,
                    "AUDIT_LOG",
                    auditLog
            );
        }

        return sb
                .toString()
                .getBytes(StandardCharsets.UTF_8);
    }

    private void appendCsvBackupRow(
            StringBuilder sb,
            String entityType,
            Object value
    ) throws IOException {

        String json =
                objectMapper.writeValueAsString(value);

        sb.append(csv(entityType))
                .append(",")
                .append(csv(json))
                .append("\n");
    }

    // =========================================================
    // EXCEL EXPORT
    // =========================================================

    private byte[] exportExcel() throws IOException {

        try (
                Workbook workbook =
                        new XSSFWorkbook();

                ByteArrayOutputStream out =
                        new ByteArrayOutputStream()
        ) {

            createEntitySheet(
                    workbook,
                    "Users",
                    userRepo.findAll()
            );

            createTaxRecordSheet(
                    workbook
            );

            createEntitySheet(
                    workbook,
                    "Admins",
                    adminRepo.findAll()
            );

            createEntitySheet(
                    workbook,
                    "AuditLogs",
                    auditLogRepo.findAll()
            );

            workbook.write(out);

            return out.toByteArray();
        }
    }

    private void createEntitySheet(
            Workbook workbook,
            String sheetName,
            List<?> entities
    ) throws IOException {

        Sheet sheet =
                workbook.createSheet(sheetName);

        Row header =
                sheet.createRow(0);

        header.createCell(0)
                .setCellValue("ID");

        header.createCell(1)
                .setCellValue("Data");

        int rowIndex = 1;

        for (Object entity : entities) {

            Row row =
                    sheet.createRow(rowIndex++);

            Long id =
                    extractId(entity);

            row.createCell(0)
                    .setCellValue(
                            id != null ? id : 0
                    );

            row.createCell(1)
                    .setCellValue(
                            objectMapper.writeValueAsString(
                                    entity
                            )
                    );
        }

        sheet.autoSizeColumn(0);
        sheet.setColumnWidth(
                1,
                12000
        );
    }

    private void createTaxRecordSheet(
            Workbook workbook
    ) throws IOException {

        Sheet sheet =
                workbook.createSheet("TaxRecords");

        String[] headers = {
                "ID",
                "Financial Year",
                "Gross Income",
                "Deductions",
                "Expenses",
                "Taxable Income",
                "Income Tax",
                "Cess",
                "Tax Rate",
                "Tax Amount",
                "User ID",
                "Created Date",
                "Updated Date"
        };

        Row header =
                sheet.createRow(0);

        for (int i = 0; i < headers.length; i++) {
            header.createCell(i)
                    .setCellValue(headers[i]);
        }

        int rowIndex = 1;

        for (TaxRecord record :
                taxRepo.findAll()) {

            Row row =
                    sheet.createRow(rowIndex++);

            setCell(row, 0, record.getId());
            setCell(row, 1, record.getFinancialYear());
            setCell(row, 2, record.getGrossIncome());
            setCell(row, 3, record.getDeductions());
            setCell(row, 4, record.getExpenses());
            setCell(row, 5, record.getTaxableIncome());
            setCell(row, 6, record.getIncomeTax());
            setCell(row, 7, record.getCess());
            setCell(row, 8, record.getTaxRate());
            setCell(row, 9, record.getTaxAmount());

            if (record.getUser() != null) {
                setCell(
                        row,
                        10,
                        record.getUser().getId()
                );
            } else {
                setCell(row, 10, "");
            }

            setCell(
                    row,
                    11,
                    record.getCreatedDate()
            );

            setCell(
                    row,
                    12,
                    record.getUpdatedDate()
            );
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void setCell(
            Row row,
            int column,
            Object value
    ) {

        Cell cell =
                row.createCell(column);

        if (value == null) {
            cell.setCellValue("");
            return;
        }

        if (value instanceof Number number) {
            cell.setCellValue(
                    number.doubleValue()
            );
            return;
        }

        if (value instanceof Boolean bool) {
            cell.setCellValue(bool);
            return;
        }

        cell.setCellValue(
                value.toString()
        );
    }

    // =========================================================
    // PDF EXPORT
    // =========================================================

    /*
     * PDF is intentionally a report/export format.
     *
     * It contains the backup information for human-readable
     * archival purposes but is NOT accepted by restoreData().
     *
     * This implementation uses OpenPDF.
     */
    private byte[] exportPdf() throws IOException {

        try (
                ByteArrayOutputStream out =
                        new ByteArrayOutputStream()
        ) {

            com.lowagie.text.Document document =
                    new com.lowagie.text.Document(
                            com.lowagie.text.PageSize.A4.rotate()
                    );

            try {

                com.lowagie.text.pdf.PdfWriter
                        .getInstance(
                                document,
                                out
                        );

                document.open();

                com.lowagie.text.Font titleFont =
                        new com.lowagie.text.Font(
                                com.lowagie.text.Font.HELVETICA,
                                18,
                                com.lowagie.text.Font.BOLD
                        );

                com.lowagie.text.Font sectionFont =
                        new com.lowagie.text.Font(
                                com.lowagie.text.Font.HELVETICA,
                                12,
                                com.lowagie.text.Font.BOLD
                        );

                document.add(
                        new com.lowagie.text.Paragraph(
                                "Tax Management System - Backup",
                                titleFont
                        )
                );

                document.add(
                        new com.lowagie.text.Paragraph(
                                "Human-readable backup/export report"
                        )
                );

                document.add(
                        new com.lowagie.text.Paragraph(" ")
                );

                addPdfSection(
                        document,
                        "Users",
                        userRepo.findAll()
                                .stream()
                                .map(this::userPdfLine)
                                .collect(Collectors.toList()),
                        sectionFont
                );

                addPdfSection(
                        document,
                        "Tax Records",
                        taxRepo.findAll()
                                .stream()
                                .map(this::taxRecordPdfLine)
                                .collect(Collectors.toList()),
                        sectionFont
                );

                addPdfSection(
                        document,
                        "Administrators",
                        adminRepo.findAll()
                                .stream()
                                .map(this::adminPdfLine)
                                .collect(Collectors.toList()),
                        sectionFont
                );

                addPdfSection(
                        document,
                        "Audit Logs",
                        auditLogRepo.findAll()
                                .stream()
                                .map(this::auditLogPdfLine)
                                .collect(Collectors.toList()),
                        sectionFont
                );

            } finally {
                document.close();
            }

            return out.toByteArray();
        }
    }

    private void addPdfSection(
            com.lowagie.text.Document document,
            String title,
            List<String> lines,
            com.lowagie.text.Font sectionFont
    ) throws com.lowagie.text.DocumentException {

        document.add(
                new com.lowagie.text.Paragraph(
                        title,
                        sectionFont
                )
        );

        if (lines.isEmpty()) {

            document.add(
                    new com.lowagie.text.Paragraph(
                            "No records."
                    )
            );

        } else {

            for (String line : lines) {

                document.add(
                        new com.lowagie.text.Paragraph(
                                line
                        )
                );
            }
        }

        document.add(
                new com.lowagie.text.Paragraph(" ")
        );
    }

    private String userPdfLine(
            User user
    ) {

        return String.format(
                Locale.ROOT,
                "ID: %s | Name: %s | Email: %s | Phone: %s | PAN: %s | Type: %s | Active: %s",
                safeString(user.getId()),
                safeString(user.getFullName()),
                safeString(user.getEmail()),
                safeString(user.getPhoneNumber()),
                safeString(user.getPanNumber()),
                user.getUserType() != null
                        ? user.getUserType().name()
                        : "",
                safeString(user.getActive())
        );
    }

    private String taxRecordPdfLine(
            TaxRecord record
    ) {

        return String.format(
                Locale.ROOT,
                "ID: %s | User ID: %s | FY: %s | Gross Income: %s | Deductions: %s | Expenses: %s | Taxable Income: %s | Income Tax: %s | Cess: %s | Rate: %s | Tax Amount: %s",
                safeString(record.getId()),
                record.getUser() != null
                        ? safeString(record.getUser().getId())
                        : "",
                safeString(record.getFinancialYear()),
                safeString(record.getGrossIncome()),
                safeString(record.getDeductions()),
                safeString(record.getExpenses()),
                safeString(record.getTaxableIncome()),
                safeString(record.getIncomeTax()),
                safeString(record.getCess()),
                safeString(record.getTaxRate()),
                safeString(record.getTaxAmount())
        );
    }

    private String adminPdfLine(
            Admin admin
    ) {

        return safeJsonLine(admin);
    }

    private String auditLogPdfLine(
            AuditLog auditLog
    ) {

        return safeJsonLine(auditLog);
    }

    private String safeJsonLine(
            Object value
    ) {

        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }

    // =========================================================
    // JSON RESTORE
    // =========================================================

    private void restoreFromJson(
            byte[] fileData
    ) throws IOException {

        BackupData data =
                objectMapper.readValue(
                        fileData,
                        BackupData.class
                );

        restoreBackupData(data);
    }

    // =========================================================
    // CSV RESTORE
    // =========================================================

    private void restoreFromCsv(
            byte[] fileData
    ) throws IOException {

        String csv =
                new String(
                        fileData,
                        StandardCharsets.UTF_8
                );

        List<User> users =
                new ArrayList<>();

        List<TaxRecord> taxRecords =
                new ArrayList<>();

        List<Admin> admins =
                new ArrayList<>();

        List<AuditLog> auditLogs =
                new ArrayList<>();

        String[] lines =
                csv.split("\\r?\\n");

        for (int i = 1; i < lines.length; i++) {

            String line = lines[i];

            if (line.isBlank()) {
                continue;
            }

            List<String> columns =
                    parseCsvLine(line);

            if (columns.size() < 2) {
                continue;
            }

            String entityType =
                    columns.get(0);

            String json =
                    columns.get(1);

            switch (entityType) {

                case "USER":

                    users.add(
                            objectMapper.readValue(
                                    json,
                                    User.class
                            )
                    );

                    break;

                case "TAX_RECORD":

                    JsonNode taxNode =
                            objectMapper.readTree(json);

                    Long userId =
                            taxNode.hasNonNull("userId")
                                    ? taxNode
                                    .get("userId")
                                    .asLong()
                                    : null;

                    if (taxNode.isObject()) {
                        ((com.fasterxml.jackson.databind.node.ObjectNode)
                                taxNode)
                                .remove("userId");
                    }

                    TaxRecord taxRecord =
                            objectMapper.treeToValue(
                                    taxNode,
                                    TaxRecord.class
                            );

                    /*
                     * Reconnection happens in restoreBackupData().
                     * Temporarily store the relationship using
                     * the entity's User reference if present.
                     */
                    if (userId != null) {

                        User reference =
                                new User();

                        reference.setId(userId);

                        taxRecord.setUser(
                                reference
                        );
                    }

                    taxRecords.add(taxRecord);

                    break;

                case "ADMIN":

                    admins.add(
                            objectMapper.readValue(
                                    json,
                                    Admin.class
                            )
                    );

                    break;

                case "AUDIT_LOG":

                    auditLogs.add(
                            objectMapper.readValue(
                                    json,
                                    AuditLog.class
                            )
                    );

                    break;

                default:
                    throw new IllegalArgumentException(
                            "Unknown backup entity type: "
                                    + entityType
                    );
            }
        }

        restoreBackupData(
                new BackupData(
                        users,
                        taxRecords,
                        admins,
                        auditLogs
                )
        );
    }

    // =========================================================
    // EXCEL RESTORE
    // =========================================================

    private void restoreFromExcel(
            byte[] fileData
    ) throws IOException {

        List<User> users =
                new ArrayList<>();

        List<TaxRecord> taxRecords =
                new ArrayList<>();

        List<Admin> admins =
                new ArrayList<>();

        List<AuditLog> auditLogs =
                new ArrayList<>();

        try (
                Workbook workbook =
                        WorkbookFactory.create(
                                new ByteArrayInputStream(
                                        fileData
                                )
                        )
        ) {

            readEntitySheet(
                    workbook,
                    "Users",
                    User.class,
                    users
            );

            readTaxRecordsSheet(
                    workbook,
                    taxRecords
            );

            readEntitySheet(
                    workbook,
                    "Admins",
                    Admin.class,
                    admins
            );

            readEntitySheet(
                    workbook,
                    "AuditLogs",
                    AuditLog.class,
                    auditLogs
            );
        }

        restoreBackupData(
                new BackupData(
                        users,
                        taxRecords,
                        admins,
                        auditLogs
                )
        );
    }

    private <T> void readEntitySheet(
            Workbook workbook,
            String sheetName,
            Class<T> type,
            List<T> target
    ) throws IOException {

        Sheet sheet =
                workbook.getSheet(sheetName);

        if (sheet == null) {
            return;
        }

        for (
                int i = 1;
                i <= sheet.getLastRowNum();
                i++
        ) {

            Row row =
                    sheet.getRow(i);

            if (row == null) {
                continue;
            }

            String json =
                    getCellString(
                            row.getCell(1)
                    );

            if (json == null || json.isBlank()) {
                continue;
            }

            target.add(
                    objectMapper.readValue(
                            json,
                            type
                    )
            );
        }
    }

    private void readTaxRecordsSheet(
            Workbook workbook,
            List<TaxRecord> target
    ) {

        Sheet sheet =
                workbook.getSheet("TaxRecords");

        if (sheet == null) {
            return;
        }

        for (
                int i = 1;
                i <= sheet.getLastRowNum();
                i++
        ) {

            Row row =
                    sheet.getRow(i);

            if (row == null) {
                continue;
            }

            TaxRecord record =
                    new TaxRecord();

            record.setId(
                    getLong(row.getCell(0))
            );

            record.setFinancialYear(
                    getCellString(
                            row.getCell(1)
                    )
            );

            record.setGrossIncome(
                    getBigDecimal(row.getCell(2))
            );

            record.setDeductions(
                    getBigDecimal(row.getCell(3))
            );

            record.setExpenses(
                    getBigDecimal(row.getCell(4))
            );

            record.setTaxableIncome(
                    getBigDecimal(row.getCell(5))
            );

            record.setIncomeTax(
                    getBigDecimal(row.getCell(6))
            );

            record.setCess(
                    getBigDecimal(row.getCell(7))
            );

            record.setTaxRate(
                    getBigDecimal(row.getCell(8))
            );

            record.setTaxAmount(
                    getBigDecimal(row.getCell(9))
            );

            Long userId =
                    getLong(row.getCell(10));

            if (userId != null) {

                User reference =
                        new User();

                reference.setId(userId);

                record.setUser(reference);
            }

            target.add(record);
        }
    }

    // =========================================================
    // COMMON RESTORE
    // =========================================================

    private void restoreBackupData(
            BackupData data
    ) {

        /*
         * Delete child records first because
         * TaxRecord references User.
         */
        taxRepo.deleteAll();

        auditLogRepo.deleteAll();

        adminRepo.deleteAll();

        userRepo.deleteAll();

        /*
         * Restore users first.
         */
        List<User> users =
                data.users() != null
                        ? userRepo.saveAll(
                                data.users()
                        )
                        : new ArrayList<>();

        Map<Long, User> usersById =
                users.stream()
                        .filter(
                                user ->
                                        user.getId() != null
                        )
                        .collect(
                                Collectors.toMap(
                                        User::getId,
                                        user -> user
                                )
                        );

        /*
         * Restore tax records and reconnect
         * their User relationship.
         */
        if (data.taxRecords() != null) {

            for (
                    TaxRecord taxRecord :
                    data.taxRecords()
            ) {

                if (
                        taxRecord.getUser() != null
                                &&
                        taxRecord.getUser().getId() != null
                ) {

                    Long userId =
                            taxRecord
                                    .getUser()
                                    .getId();

                    User actualUser =
                            usersById.get(userId);

                    if (actualUser == null) {

                        throw new IllegalArgumentException(
                                "Backup contains a tax record referencing missing user ID: "
                                        + userId
                        );
                    }

                    taxRecord.setUser(
                            actualUser
                    );
                }
            }

            taxRepo.saveAll(
                    data.taxRecords()
            );
        }

        /*
         * Restore admins.
         */
        if (data.admins() != null) {

            adminRepo.saveAll(
                    data.admins()
            );
        }

        /*
         * Restore audit logs.
         */
        if (data.auditLogs() != null) {

            auditLogRepo.saveAll(
                    data.auditLogs()
            );
        }
    }

    // =========================================================
    // CSV HELPERS
    // =========================================================

    private List<String> parseCsvLine(
            String line
    ) {

        List<String> result =
                new ArrayList<>();

        StringBuilder current =
                new StringBuilder();

        boolean quoted = false;

        for (int i = 0; i < line.length(); i++) {

            char c = line.charAt(i);

            if (c == '"') {

                if (
                        quoted
                                &&
                        i + 1 < line.length()
                                &&
                        line.charAt(i + 1) == '"'
                ) {

                    current.append('"');
                    i++;

                } else {

                    quoted = !quoted;
                }

            } else if (
                    c == ','
                            &&
                    !quoted
            ) {

                result.add(
                        current.toString()
                );

                current.setLength(0);

            } else {

                current.append(c);
            }
        }

        result.add(
                current.toString()
        );

        return result;
    }

    private String csv(
            Object value
    ) {

        if (value == null) {
            return "";
        }

        String text =
                value.toString();

        return "\"" +
                text.replace(
                        "\"",
                        "\"\""
                ) +
                "\"";
    }

    // =========================================================
    // EXCEL HELPERS
    // =========================================================

    private String getCellString(
            Cell cell
    ) {

        if (cell == null) {
            return "";
        }

        DataFormatter formatter =
                new DataFormatter();

        return formatter.formatCellValue(
                cell
        );
    }

    private Long getLong(
            Cell cell
    ) {

        if (cell == null) {
            return null;
        }

        if (
                cell.getCellType()
                        == CellType.NUMERIC
        ) {

            return (long)
                    cell.getNumericCellValue();
        }

        String value =
                getCellString(cell);

        if (value.isBlank()) {
            return null;
        }

        try {
            return Long.parseLong(
                    value
            );
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private java.math.BigDecimal getBigDecimal(
            Cell cell
    ) {

        String value =
                getCellString(cell);

        if (
                value == null
                        ||
                value.isBlank()
        ) {
            return null;
        }

        try {
            return new java.math.BigDecimal(
                    value
            );
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long extractId(
            Object entity
    ) {

        try {

            return (Long)
                    entity
                            .getClass()
                            .getMethod("getId")
                            .invoke(entity);

        } catch (Exception e) {

            return null;
        }
    }

    // =========================================================
    // GENERAL HELPERS
    // =========================================================

    private String normalizeFormat(
            String format
    ) {

        if (format == null) {
            return "";
        }

        String normalized =
                format
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if ("excel".equals(normalized)) {
            return "xlsx";
        }

        return normalized;
    }

    private String safeString(
            Object value
    ) {

        return value == null
                ? ""
                : value.toString();
    }

    // =========================================================
    // BACKUP DATA
    // =========================================================

    private record BackupData(
            List<User> users,
            List<TaxRecord> taxRecords,
            List<Admin> admins,
            List<AuditLog> auditLogs
    ) {
    }
}