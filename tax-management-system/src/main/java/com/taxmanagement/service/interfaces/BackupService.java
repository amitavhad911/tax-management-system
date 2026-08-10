package com.taxmanagement.service.interfaces;

import java.io.IOException;

public interface BackupService {
    byte[] exportData(String format) throws IOException;
    void restoreData(byte[] fileData, String format) throws IOException;
}