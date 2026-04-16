package com.healthcare.ai_symptom_service.service.impl;

import com.healthcare.ai_symptom_service.service.SymptomService;
import com.healthcare.ai_symptom_service.service.dto.SymptomRequestDTO;
import com.healthcare.ai_symptom_service.service.dto.SymptomResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SymptomServiceImpl implements SymptomService {

    /*
    //    String prompt = buildPrompt(symptoms);
//
//    String aiResponse = openAIClient.call(prompt);
//
//    SymptomResponseDTO response = parse(aiResponse);
//
//    return response;

//    1. Validate input
//    2. Build AI prompt
//    3. Call AI API
//    4. Parse response
//    5. Return DTO
     */

    private static final String DISCLAIMER =
            "This is not a medical diagnosis. Please consult a doctor.";

    @Override
    public SymptomResponseDTO analyzeSymptoms(SymptomRequestDTO request) {
        // Hardcoded response for now
        return new SymptomResponseDTO(
                List.of("Common Cold", "Influenza"),
                List.of("General Practitioner", "Internal Medicine"),
                "Low",
                DISCLAIMER
        );
    }

    private String buildPrompt(String symptoms) {
        return "You are a medical assistant.\n" +
                "Given symptoms: " + symptoms + "\n" +
                "Return JSON with:\n" +
                "- possibleConditions (max 3)\n" +
                "- recommendedSpecialties (max 2)\n" +
                "- urgencyLevel (LOW, MEDIUM, HIGH)\n" +
                "Respond ONLY in JSON.";
    }
}
