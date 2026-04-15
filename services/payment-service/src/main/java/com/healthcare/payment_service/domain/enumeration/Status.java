package com.healthcare.payment_service.domain.enumeration;

/**
 * The payment status enumeration.
 */
public enum Status {
    PENDING,
    SUCCESS,
    CANCELLED,
    FAILED,
    CHARGEDBACK;

    public static Status getMatchingStatus(String statusCode) {
        return switch (statusCode) {
            case "0" -> PENDING;
            case "2" -> SUCCESS;
            case "-1" -> CANCELLED;
            case "-2" -> FAILED;
            case "-3" -> CHARGEDBACK;
            default -> throw new IllegalArgumentException("PayHere status code unknown: " + statusCode);
        };
    }
}
