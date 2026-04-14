package com.healthcare.payment_service.domain;

import com.healthcare.payment_service.domain.enumeration.Status;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A Payment made by patients for doctor appointments.
 */
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String appointmentId;

    private BigDecimal amount;

    private Status status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime modifiedAt;

    // Constructors
    public Payment() {}

    public Payment(
            String appointmentId,
            BigDecimal amount,
            Status status
    ) {
        this.appointmentId = appointmentId;
        this.amount = amount;
        this.status = status;
    }

    // Getters & Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

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

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getModifiedAt() {
        return modifiedAt;
    }
    public void setModifiedAt(LocalDateTime modifiedAt) {
        this.modifiedAt = modifiedAt;
    }
}
