package com.healthcare.payment_service.validation;

import com.healthcare.payment_service.config.PayHereUtil;
import com.healthcare.payment_service.repository.PaymentRepository;
import com.healthcare.payment_service.service.dto.PayHereCallbackDTO;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Component
public class PaymentValidation {

    private final Logger log = LoggerFactory.getLogger(PaymentValidation.class);

    private final PayHereUtil payHereUtil;
    private final PaymentRepository paymentRepository;

    public PaymentValidation(
            PayHereUtil payHereUtil,
            PaymentRepository paymentRepository
    ) {
        this.payHereUtil = payHereUtil;
        this.paymentRepository = paymentRepository;
    }

    public void validateInitiatingPayment(final PaymentRequestDTO paymentRequestDTO) {

        // Validate authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        // Validate appointmentId
        if (paymentRequestDTO.getAppointmentId() == null || paymentRequestDTO.getAppointmentId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment ID is required");
        }

        // Validate amount
        if (paymentRequestDTO.getAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }

        if (paymentRequestDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        log.debug("Payment validation passed for appointmentId: {}", paymentRequestDTO.getAppointmentId());
    }

    public void validatePaymentCallback(final PayHereCallbackDTO payHereCallbackDTO) {
        log.info("Request to validate payment callback : {}", payHereCallbackDTO);

        if (payHereCallbackDTO.getOrderId() == null || payHereCallbackDTO.getOrderId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. Order ID cannot be null.");
        }

        if (payHereCallbackDTO.getPayhereAmount() == null || payHereCallbackDTO.getPayhereAmount().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. Amount cannot be null.");
        }

        if (payHereCallbackDTO.getPayhereCurrency() == null || payHereCallbackDTO.getPayhereCurrency().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. Currency cannot be null.");
        }

        if (payHereCallbackDTO.getStatusCode() == null || payHereCallbackDTO.getStatusCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. Status code cannot be null.");
        }

        if (payHereCallbackDTO.getMd5sig() == null || payHereCallbackDTO.getMd5sig().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. PayHere hash cannot be null.");
        }

        // Validate PayHere hash
        validatePayHereHash(payHereCallbackDTO);

        // Verify payment exists
        paymentRepository
                .findById(payHereCallbackDTO.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment processing failed. Payment not found."));

        if (payHereCallbackDTO.getPaymentId() == null || payHereCallbackDTO.getPaymentId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. PayHere Payment ID cannot be null.");
        }
    }

    private void validatePayHereHash(final PayHereCallbackDTO payHereCallbackDTO) {
        final String localHash = payHereUtil.getPayHereNotificationHash(
                payHereCallbackDTO.getOrderId(),
                Double.parseDouble(payHereCallbackDTO.getPayhereAmount()),
                payHereCallbackDTO.getPayhereCurrency(),
                payHereCallbackDTO.getStatusCode()
        );

        if (!localHash.equals(payHereCallbackDTO.getMd5sig())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment processing failed. PayHere hash does not match.");
        }
    }


}