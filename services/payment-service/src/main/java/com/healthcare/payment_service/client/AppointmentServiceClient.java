package com.healthcare.payment_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class AppointmentServiceClient {

    private final Logger log = LoggerFactory.getLogger(AppointmentServiceClient.class);

    private final WebClient webClient;

    public AppointmentServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${external.appointment-service.base-url}") String baseUrl
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public void confirmAppointment(String appointmentId) {
        log.info("Calling appointment service to confirm appointmentId: {}", appointmentId);

        webClient.put()
                .uri("/appointments/{id}/confirm", appointmentId)
                .retrieve()
                .toBodilessEntity()
                .doOnError(e -> log.error("Failed to confirm appointment {}: {}", appointmentId, e.getMessage()))
                .subscribe(); // non-blocking — fire and forget
    }
}