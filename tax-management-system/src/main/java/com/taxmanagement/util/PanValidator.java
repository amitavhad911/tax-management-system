package com.taxmanagement.util;

import java.util.regex.Pattern;

public class PanValidator {
    private static final Pattern PAN_PATTERN = Pattern.compile("[A-Z]{5}[0-9]{4}[A-Z]{1}");
    public static boolean isValid(String pan) {
        return pan != null && PAN_PATTERN.matcher(pan).matches();
    }
}
