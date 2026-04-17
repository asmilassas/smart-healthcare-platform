package com.healthcare.payment_service.client;

import com.healthcare.payment_service.client.dto.PatientDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PatientServiceClient {

    private final Logger log = LoggerFactory.getLogger(PatientServiceClient.class);

    private final WebClient webClient;

    public PatientServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${external.patient-service.base-url}") String baseUrl
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public PatientDTO getPatientById(String patientId) {
        log.info("Fetching patient details for id: {}", patientId);

        try {
            return webClient.get()
                    .uri("/api/patients/{id}", patientId)
                    .retrieve()
                    .bodyToMono(PatientDTO.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch patient {}: {}", patientId, e.getMessage());
            return null;
        }
    }
}