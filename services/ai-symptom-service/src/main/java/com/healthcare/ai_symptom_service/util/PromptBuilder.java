package com.healthcare.ai_symptom_service.util;

public class PromptBuilder {

    private PromptBuilder() {}

    public static String buildSymptomPrompt(String symptoms) {
        return """
                You are a medical assistant AI. A patient has reported the following symptoms: "%s"

                Analyze these symptoms and respond ONLY with a valid JSON object in exactly this format:
                {
                  "possibleConditions": ["condition1", "condition2", "condition3"],
                  "recommendedSpecialties": ["specialty1", "specialty2"],
                  "urgencyLevel": "Low | Medium | High"
                }

                Rules:
                - Return ONLY the JSON object. No explanations, no extra text, no markdown.
                - possibleConditions: 2 to 4 most likely conditions
                - recommendedSpecialties: 1 to 3 relevant doctor specialties
                - urgencyLevel: must be exactly one of: Low, Medium, High
                - If symptoms suggest emergency (e.g. chest pain, difficulty breathing), set urgencyLevel to High
                """.formatted(symptoms);
    }
}
