package com.healthcare.payment_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.payment_service.service.PaymentService;
import com.healthcare.payment_service.service.dto.PayHereCallbackDTO;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import com.healthcare.payment_service.service.dto.PaymentResponseDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

/**
 * REST controller for managing Payment.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentResource {

    private final Logger log = LoggerFactory.getLogger(PaymentResource.class);
    private final Validator validator;
    private final ObjectMapper objectMapper;

    private final PaymentService paymentService;

    public PaymentResource(
        PaymentService paymentService,
        Validator validator,
        ObjectMapper objectMapper
    ) {
        this.paymentService = paymentService;
        this.validator = validator;
        this.objectMapper = objectMapper;
    }

    /**
     * {@code POST /initiate} : Initiate a payment.
     *
     * @param paymentRequestDTO the payment request details.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the created payment in the body.
     */
    @PostMapping("/initiate")
    @PreAuthorize("isAuthenticated()")
    //    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@Valid @RequestBody PaymentRequestDTO paymentRequestDTO) {
        log.debug("REST request to initiate payment : {}", paymentRequestDTO);

        final PaymentResponseDTO result = paymentService.initiatePayment(paymentRequestDTO);

        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code POST /callback} : Handle PayHere payment callback.
     *
     * @param payHereCallbackParams the callback data sent by PayHere.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @PostMapping(path = "/callback", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> completePayment(@RequestParam MultiValueMap<String, String> payHereCallbackParams) {
        log.debug("REST request to callback payment : {}", payHereCallbackParams);

        final Map<String, String> map = payHereCallbackParams.toSingleValueMap();
        final PayHereCallbackDTO payHereCallbackDTO = objectMapper.convertValue(map, PayHereCallbackDTO.class);

        final Set<ConstraintViolation<PayHereCallbackDTO>> violations = validator.validate(payHereCallbackDTO);
        if (!violations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, violations.iterator().next().getMessage());
        }

        paymentService.callbackPayment(payHereCallbackDTO);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * {@code GET /payments/:appointmentId} : Get payment status by appointment ID.
     *
     * @param appointmentId the appointment ID of the patient.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the payment in the body.
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    //    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(@PathVariable String appointmentId) {
        log.debug("REST request to get payment status for appointmentId : {}", appointmentId);

        final PaymentResponseDTO result = paymentService.getPaymentStatus(appointmentId);

        return ResponseEntity.ok().body(result);
    }
}
