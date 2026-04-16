package com.healthcare.ai_symptom_service.service.dto;

import jakarta.validation.constraints.NotBlank;

public class SymptomRequestDTO {

    @NotBlank(message = "Symptoms must not be empty")
    private String symptoms;

    // getters & setters
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
}