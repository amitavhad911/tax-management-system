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

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData(
            @RequestParam(defaultValue = "json") String format
    ) throws IOException {

        byte[] data = backupService.exportData(format);

        String normalizedFormat = format.toLowerCase();

        String extension;
        MediaType contentType;

        switch (normalizedFormat) {

            case "json":
                extension = "json";
                contentType = MediaType.APPLICATION_JSON;
                break;

            case "csv":
                extension = "csv";
                contentType = MediaType.parseMediaType("text/csv");
                break;

            case "xlsx":
            case "excel":
                extension = "xlsx";
                contentType = MediaType.APPLICATION_OCTET_STREAM;
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

    @PostMapping(
            value = "/restore",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> restore(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "json") String format
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(
                            ApiResponse.<Void>builder()
                                    .success(false)
                                    .message("Backup file is empty")
                                    .build()
                    );
        }

        backupService.restoreData(
                file.getBytes(),
                format
        );

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Data restored successfully")
                        .build()
        );
    }
}