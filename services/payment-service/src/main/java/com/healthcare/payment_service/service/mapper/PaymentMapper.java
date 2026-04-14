package com.healthcare.payment_service.service.mapper;

import com.healthcare.payment_service.domain.Payment;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import com.healthcare.payment_service.service.dto.PaymentResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public Payment toEntity(final PaymentRequestDTO paymentRequestDTO) {
        Payment payment = new Payment();
        payment.setAppointmentId(paymentRequestDTO.getAppointmentId());
        payment.setAmount(paymentRequestDTO.getAmount());
        return payment;
    }

    public PaymentResponseDTO toPaymentResponseDTO(final Payment payment) {
        PaymentResponseDTO paymentResponseDTO = new PaymentResponseDTO();
        paymentResponseDTO.setPaymentId(payment.getId());
        paymentResponseDTO.setAppointmentId(payment.getAppointmentId());
        paymentResponseDTO.setAmount(payment.getAmount());
        paymentResponseDTO.setStatus(payment.getStatus());
        paymentResponseDTO.setCreatedAt(payment.getCreatedAt());
        paymentResponseDTO.setModifiedAt(payment.getModifiedAt());
        return paymentResponseDTO;
    }
}
