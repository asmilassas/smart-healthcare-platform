package com.healthcare.ai_symptom_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class GroqClient {

    private static final Logger log = LoggerFactory.getLogger(GroqClient.class);

    private static final String GROQ_API_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    @Value("${groq.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GroqClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends a prompt to Groq and returns the raw text response.
     * SymptomServiceImpl is responsible for building the prompt and parsing the result.
     */
    public String sendPrompt(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String requestBody = buildRequestBody(prompt);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        log.debug("Sending request to Groq API...");

        ResponseEntity<String> response = restTemplate.exchange(
                GROQ_API_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        log.debug("Raw Groq response: {}", response.getBody());

        return extractContent(response.getBody());
    }

    private String buildRequestBody(String prompt) {
        // Uses Groq's OpenAI-compatible chat format
        return """
                {
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {
                            "role": "user",
                            "content": %s
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 500
                }
                """.formatted(toJsonString(prompt));
    }

    private String extractContent(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
        } catch (Exception e) {
            log.error("Failed to parse Groq response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Groq API response", e);
        }
    }

    private String toJsonString(String text) {
        try {
            return objectMapper.writeValueAsString(text);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize prompt", e);
        }
    }
}