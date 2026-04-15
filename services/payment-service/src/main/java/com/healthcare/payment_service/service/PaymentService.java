package com.healthcare.payment_service.service;

import com.healthcare.payment_service.service.dto.PayHereCallbackDTO;
import com.healthcare.payment_service.service.dto.PaymentInitiateResponseDTO;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import com.healthcare.payment_service.service.dto.PaymentResponseDTO;

/**
 * Service interface for managing Payment.
 */
public interface PaymentService {

    /**
     * Initiate a payment.
     *
     * @param paymentRequestDTO contains information to initiate a payment.
     * @return the persisted entity.
     */
    PaymentInitiateResponseDTO initiatePayment(PaymentRequestDTO paymentRequestDTO);

    /**
     * Callback method for PayHere.
     *
     * @param payHereCallbackDTO contains information provided by PayHere.
     * @return the persisted entity.
     */
    PaymentResponseDTO callbackPayment(PayHereCallbackDTO payHereCallbackDTO);

    /**
     * Get Payment Status via appointmentId
     *
     * @param appointmentId the appointment ID of the patient.
     * @return the found entity.
     */
    PaymentResponseDTO getPaymentStatus(String appointmentId);
}
