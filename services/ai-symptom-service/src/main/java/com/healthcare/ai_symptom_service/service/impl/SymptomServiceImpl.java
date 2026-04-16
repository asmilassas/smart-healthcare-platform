package com.healthcare.ai_symptom_service.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.ai_symptom_service.client.GroqClient;
import com.healthcare.ai_symptom_service.service.SymptomService;
import com.healthcare.ai_symptom_service.service.dto.SymptomRequestDTO;
import com.healthcare.ai_symptom_service.service.dto.SymptomResponseDTO;
import com.healthcare.ai_symptom_service.util.PromptBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SymptomServiceImpl implements SymptomService {

    private static final Logger log = LoggerFactory.getLogger(SymptomServiceImpl.class);

    private static final String DISCLAIMER =
            "This is not a medical diagnosis. Please consult a doctor.";

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public SymptomServiceImpl(GroqClient groqClient, ObjectMapper objectMapper) {
        this.groqClient = groqClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public SymptomResponseDTO analyzeSymptoms(SymptomRequestDTO request) {
        String prompt = PromptBuilder.buildSymptomPrompt(request.getSymptoms());

        try {
            String rawResponse = groqClient.sendPrompt(prompt);
            return parseGroqResponse(rawResponse);
        } catch (Exception e) {
            log.error("AI analysis failed: {}", e.getMessage());
            return buildFallbackResponse();
        }
    }

    // Response Parsing
    private SymptomResponseDTO parseGroqResponse(String rawResponse) {
        try {
            String cleanedJson = extractJson(rawResponse);
            log.debug("Cleaned JSON: {}", cleanedJson);

            JsonNode root = objectMapper.readTree(cleanedJson);

            List<String> conditions = parseStringList(root.path("possibleConditions"));
            List<String> specialties = parseStringList(root.path("recommendedSpecialties"));
            String urgency = root.path("urgencyLevel").asText("Low");

            // Validate urgencyLevel — default to Low if unexpected value
            if (!List.of("Low", "Medium", "High").contains(urgency)) {
                urgency = "Low";
            }

            return new SymptomResponseDTO(conditions, specialties, urgency, DISCLAIMER);

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}. Raw: {}", e.getMessage(), rawResponse);
            return buildFallbackResponse();
        }
    }


    // Extracts the JSON object from the response string.
    // Handles cases where the model adds extra text before/after the JSON.
    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');

        if (start == -1 || end == -1 || end < start) {
            throw new RuntimeException("No valid JSON object found in AI response");
        }

        return text.substring(start, end + 1);
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(item -> result.add(item.asText()));
        }
        return result;
    }

    // Fallback for when AI fails
    private SymptomResponseDTO buildFallbackResponse() {
        return new SymptomResponseDTO(
                List.of("Unable to determine — please consult a doctor"),
                List.of("General Practitioner"),
                "Low",
                DISCLAIMER
        );
    }
}
