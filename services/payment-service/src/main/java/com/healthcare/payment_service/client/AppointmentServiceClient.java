package com.healthcare.payment_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

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

    public void updatePaymentStatus(String appointmentId, String paymentId) {
        log.info("Updating payment status for appointmentId: {}", appointmentId);

        webClient.patch()
                .uri("/api/appointments/{id}/payment", appointmentId)
                .bodyValue(Map.of(
                        "paymentStatus", "paid",
                        "paymentId", paymentId
                ))
                .retrieve()
                .toBodilessEntity()
                .doOnError(e -> log.error("Failed to update payment for {}: {}", appointmentId, e.getMessage()))
                .subscribe();
    }
}