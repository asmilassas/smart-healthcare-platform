package com.healthcare.payment_service.service.dto;

import java.math.BigDecimal;

public class PaymentRequestDTO {
    private String appointmentId;
    private BigDecimal amount;

    // Getters & Setters
    public String getAppointmentId() {
        return appointmentId;
    }
    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
