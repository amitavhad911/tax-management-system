package com.taxmanagement.exception;

public class DuplicatePanException extends RuntimeException {
    public DuplicatePanException(String pan) {
        super("User with PAN " + pan + " already exists");
    }
}
