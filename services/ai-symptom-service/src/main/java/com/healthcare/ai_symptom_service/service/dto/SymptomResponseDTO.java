package com.healthcare.ai_symptom_service.service.dto;

import java.util.List;

public class SymptomResponseDTO {

    private List<String> possibleConditions;
    private List<String> recommendedSpecialties;
    private String urgencyLevel;
    private String disclaimer;

    // constructor
    public SymptomResponseDTO(
        List<String> possibleConditions,
        List<String> recommendedSpecialties,
        String urgencyLevel,
        String disclaimer
    ) {
        this.possibleConditions = possibleConditions;
        this.recommendedSpecialties = recommendedSpecialties;
        this.urgencyLevel = urgencyLevel;
        this.disclaimer = disclaimer;
    }

    // getters & setters
    public List<String> getPossibleConditions() { return possibleConditions; }
    public void setPossibleConditions(List<String> possibleConditions) { this.possibleConditions = possibleConditions; }

    public List<String> getRecommendedSpecialties() { return recommendedSpecialties; }
    public void setRecommendedSpecialties(List<String> recommendedSpecialties) { this.recommendedSpecialties = recommendedSpecialties; }

    public String getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}