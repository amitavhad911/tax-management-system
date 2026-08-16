package com.taxmanagement.controller;

import com.taxmanagement.dto.response.ApiResponse;
import com.taxmanagement.service.interfaces.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    private static final Set<String> EXPORT_FORMATS =
            Set.of("json", "csv", "xlsx", "pdf");

    private static final Set<String> RESTORE_FORMATS =
            Set.of("json", "csv", "xlsx");

    // =========================================================
    // EXPORT
    // =========================================================

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData(
            @RequestParam(defaultValue = "json") String format
    ) throws IOException {

        String normalizedFormat =
                normalizeFormat(format);

        if (!EXPORT_FORMATS.contains(normalizedFormat)) {
            throw new IllegalArgumentException(
                    "Unsupported backup format: " + format
            );
        }

        byte[] data =
                backupService.exportData(normalizedFormat);

        String extension = normalizedFormat;

        MediaType contentType;

        switch (normalizedFormat) {

            case "json":
                contentType = MediaType.APPLICATION_JSON;
                break;

            case "csv":
                contentType =
                        MediaType.parseMediaType("text/csv");
                break;

            case "xlsx":
                contentType =
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                break;

            case "pdf":
                contentType = MediaType.APPLICATION_PDF;
                break;

            default:
                throw new IllegalArgumentException(
                        "Unsupported backup format: " + format
                );
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=tax-management-backup."
                                + extension
                )
                .contentType(contentType)
                .body(data);
    }

    // =========================================================
    // RESTORE
    // =========================================================

    @PostMapping(
            value = "/restore",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> restore(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "") String format
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(
                            ApiResponse.<Void>builder()
                                    .success(false)
                                    .message(
                                            "Backup file is empty"
                                    )
                                    .build()
                    );
        }

        String detectedFormat =
                detectExtension(
                        file.getOriginalFilename()
                );

        if (!RESTORE_FORMATS.contains(detectedFormat)) {

            String message;

            if ("pdf".equals(detectedFormat)) {
                message =
                        "PDF backups are export-only and cannot be used to restore database data.";
            } else {
                message =
                        "Unsupported backup format. Restore supports CSV, Excel and JSON.";
            }

            return ResponseEntity.badRequest()
                    .body(
                            ApiResponse.<Void>builder()
                                    .success(false)
                                    .message(message)
                                    .build()
                    );
        }

        /*
         * Do not trust the frontend format blindly.
         *
         * The actual uploaded file extension is authoritative.
         */
        if (format != null && !format.isBlank()) {

            String requestedFormat =
                    normalizeFormat(format);

            if (!detectedFormat.equals(requestedFormat)) {

                return ResponseEntity.badRequest()
                        .body(
                                ApiResponse.<Void>builder()
                                        .success(false)
                                        .message(
                                                "Backup format does not match the selected file."
                                        )
                                        .build()
                        );
            }
        }

        backupService.restoreData(
                file.getBytes(),
                detectedFormat
        );

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message(
                                "Data restored successfully"
                        )
                        .build()
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private String normalizeFormat(String format) {

        if (format == null) {
            return "";
        }

        String normalized =
                format
                        .trim()
                        .toLowerCase(Locale.ROOT);

        if ("excel".equals(normalized)) {
            return "xlsx";
        }

        return normalized;
    }

    private String detectExtension(String filename) {

        if (filename == null || !filename.contains(".")) {
            return "";
        }

        return filename
                .substring(
                        filename.lastIndexOf('.') + 1
                )
                .toLowerCase(Locale.ROOT);
    }
}