package com.taxmanagement.service.impl;

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
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BackupServiceImpl implements BackupService {

    private final UserRepository userRepo;
    private final TaxRecordRepository taxRepo;
    private final AdminRepository adminRepo;
    private final AuditLogRepository auditLogRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public byte[] exportData(String format) throws IOException {

        if ("json".equalsIgnoreCase(format)) {
            return exportJson();
        }

        if ("csv".equalsIgnoreCase(format)) {
            return exportCsv();
        }

        if ("xlsx".equalsIgnoreCase(format)
         || "excel".equalsIgnoreCase(format)) {
            return exportExcel();
        }

        throw new IllegalArgumentException(
                "Unsupported format: " + format
        );
    }

    @Override
    public void restoreData(
            byte[] fileData,
            String format
    ) throws IOException {

        if (!"json".equalsIgnoreCase(format)) {
            throw new IllegalArgumentException(
                    "Restore only supports JSON format."
            );
        }

        restoreFromJson(fileData);
    }

    private byte[] exportJson() throws IOException {

        BackupData data = new BackupData(
                userRepo.findAll(),
                taxRepo.findAll(),
                adminRepo.findAll(),
                auditLogRepo.findAll()
        );

        return objectMapper
                .writerWithDefaultPrettyPrinter()
                .writeValueAsBytes(data);
    }

    private byte[] exportCsv() throws IOException {

        StringBuilder sb = new StringBuilder();

        sb.append(
                "id,fullName,email,phoneNumber,address,panNumber,userType,active\n"
        );

        for (User user : userRepo.findAll()) {

            sb.append(csv(user.getId()))
                    .append(",")
                    .append(csv(user.getFullName()))
                    .append(",")
                    .append(csv(user.getEmail()))
                    .append(",")
                    .append(csv(user.getPhoneNumber()))
                    .append(",")
                    .append(csv(user.getAddress()))
                    .append(",")
                    .append(csv(user.getPanNumber()))
                    .append(",")
                    .append(csv(
                            user.getUserType() != null
                                    ? user.getUserType().name()
                                    : ""
                    ))
                    .append(",")
                    .append(csv(
                            user.getActive() != null
                                    ? user.getActive().toString()
                                    : ""
                    ))
                    .append("\n");
        }

        return sb.toString()
                .getBytes(StandardCharsets.UTF_8);
    }

    private byte[] exportExcel() throws IOException {

        Workbook workbook = new XSSFWorkbook();

        try {

            Sheet sheet = workbook.createSheet("Users");

            Row header = sheet.createRow(0);

            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("Full Name");
            header.createCell(2).setCellValue("Email");
            header.createCell(3).setCellValue("Phone Number");
            header.createCell(4).setCellValue("Address");
            header.createCell(5).setCellValue("PAN");
            header.createCell(6).setCellValue("User Type");
            header.createCell(7).setCellValue("Active");

            int rowNum = 1;

            for (User user : userRepo.findAll()) {

                Row row = sheet.createRow(rowNum++);

                row.createCell(0)
                        .setCellValue(
                                user.getId() != null
                                        ? user.getId()
                                        : 0
                        );

                row.createCell(1)
                        .setCellValue(
                                safe(user.getFullName())
                        );

                row.createCell(2)
                        .setCellValue(
                                safe(user.getEmail())
                        );

                row.createCell(3)
                        .setCellValue(
                                safe(user.getPhoneNumber())
                        );

                row.createCell(4)
                        .setCellValue(
                                safe(user.getAddress())
                        );

                row.createCell(5)
                        .setCellValue(
                                safe(user.getPanNumber())
                        );

                row.createCell(6)
                        .setCellValue(
                                user.getUserType() != null
                                        ? user.getUserType().name()
                                        : ""
                        );

                row.createCell(7)
                        .setCellValue(
                                user.getActive() != null
                                        ? user.getActive()
                                        : false
                        );
            }

            for (int i = 0; i < 8; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out =
                    new ByteArrayOutputStream();

            workbook.write(out);

            return out.toByteArray();

        } finally {
            workbook.close();
        }
    }

    private void restoreFromJson(
            byte[] fileData
    ) throws IOException {

        BackupData data = objectMapper.readValue(
                fileData,
                BackupData.class
        );

        /*
         * Delete child records first because
         * TaxRecord has a foreign key to User.
         */
        taxRepo.deleteAll();

        auditLogRepo.deleteAll();

        adminRepo.deleteAll();

        userRepo.deleteAll();

        /*
         * Save users first.
         */
        List<User> users = userRepo.saveAll(
                data.users()
        );

        /*
         * Reconnect TaxRecord -> User.
         */
        if (data.taxRecords() != null) {

            for (TaxRecord taxRecord : data.taxRecords()) {

                if (taxRecord.getUser() != null
                        && taxRecord.getUser().getId() != null) {

                    Long userId =
                            taxRecord.getUser().getId();

                    users.stream()
                            .filter(user ->
                                    user.getId().equals(userId)
                            )
                            .findFirst()
                            .ifPresent(taxRecord::setUser);
                }
            }

            taxRepo.saveAll(data.taxRecords());
        }

        if (data.admins() != null) {
            adminRepo.saveAll(data.admins());
        }

        if (data.auditLogs() != null) {
            auditLogRepo.saveAll(data.auditLogs());
        }
    }

    private String csv(Object value) {

        if (value == null) {
            return "";
        }

        String text = value.toString();

        if (text.contains(",")
                || text.contains("\"")
                || text.contains("\n")) {

            return "\"" +
                    text.replace("\"", "\"\"") +
                    "\"";
        }

        return text;
    }

    private String safe(String value) {

        return value == null ? "" : value;
    }

    private record BackupData(
            List<User> users,
            List<TaxRecord> taxRecords,
            List<Admin> admins,
            List<AuditLog> auditLogs
    ) {
    }
}