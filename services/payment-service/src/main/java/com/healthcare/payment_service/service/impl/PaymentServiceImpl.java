package com.healthcare.payment_service.service.impl;

import com.healthcare.payment_service.client.AppointmentServiceClient;
import com.healthcare.payment_service.domain.Payment;
import com.healthcare.payment_service.domain.enumeration.Status;
import com.healthcare.payment_service.repository.PaymentRepository;
import com.healthcare.payment_service.service.PaymentService;
import com.healthcare.payment_service.service.dto.PayHereCallbackDTO;
import com.healthcare.payment_service.service.dto.PaymentInitiateResponseDTO;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import com.healthcare.payment_service.service.dto.PaymentResponseDTO;
import com.healthcare.payment_service.service.mapper.PaymentInitiateResponseMapper;
import com.healthcare.payment_service.service.mapper.PaymentMapper;
import com.healthcare.payment_service.validation.PaymentValidation;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


/**
 * Service Implementation for managing Payment.
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final PaymentValidation paymentValidation;
    private final PaymentMapper paymentMapper;
    private final PaymentInitiateResponseMapper paymentInitiateResponseMapper;
    private final AppointmentServiceClient appointmentServiceClient;

    public PaymentServiceImpl(
        PaymentRepository paymentRepository,
        PaymentValidation paymentValidation,
        PaymentMapper paymentMapper,
        PaymentInitiateResponseMapper paymentInitiateResponseMapper,
        AppointmentServiceClient appointmentServiceClient
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentValidation = paymentValidation;
        this.paymentMapper = paymentMapper;
        this.paymentInitiateResponseMapper = paymentInitiateResponseMapper;
        this.appointmentServiceClient = appointmentServiceClient;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public PaymentInitiateResponseDTO initiatePayment(final PaymentRequestDTO paymentRequestDTO) {

        log.info("Request to initiate payment : {}", paymentRequestDTO);

        paymentValidation.validateInitiatingPayment(paymentRequestDTO);

        Payment payment = paymentMapper.toEntity(paymentRequestDTO);

        payment.setStatus(Status.PENDING);

        log.info("Saving initiated payment: {}", payment);
        payment = paymentRepository.save(payment);

        return paymentInitiateResponseMapper.toPaymentInitiateResponseDTO(payment, paymentRequestDTO);
    }


    @Transactional(rollbackFor = Exception.class)
    @Override
    public PaymentResponseDTO callbackPayment(final PayHereCallbackDTO payHereCallbackDTO) {
        log.info("Request to payment callback: {}", payHereCallbackDTO);

        paymentValidation.validatePaymentCallback(payHereCallbackDTO);

        final Payment payment = paymentRepository
                .findById(payHereCallbackDTO.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found."));

        payment.setPayHerePaymentId(payHereCallbackDTO.getPaymentId());

        payment.setStatus(Status.getMatchingStatus(payHereCallbackDTO.getStatusCode()));

        log.info("Payment updated: {}", payment);
        final Payment savedPayment = paymentRepository.save(payment);

        if (savedPayment.getStatus().equals(Status.SUCCESS)) {
            appointmentServiceClient.updatePaymentStatus(
                    savedPayment.getAppointmentId(),
                    savedPayment.getId()
            );
        }

        return paymentMapper.toPaymentResponseDTO(savedPayment);
    }

    @Override
public PaymentResponseDTO getPaymentStatus(final String appointmentId) {
    final List<Payment> payments = paymentRepository
            .findAllByAppointmentIdOrderByCreatedAtDesc(appointmentId);

    if (payments.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found for appointmentId: " + appointmentId);
    }

    return paymentMapper.toPaymentResponseDTO(payments.get(0));
}
}