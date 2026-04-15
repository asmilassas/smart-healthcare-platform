package com.healthcare.payment_service.service.mapper;

import com.healthcare.payment_service.config.PayHereUtil;
import com.healthcare.payment_service.domain.Payment;
import com.healthcare.payment_service.service.dto.PaymentInitiateResponseDTO;
import com.healthcare.payment_service.service.dto.PaymentRequestDTO;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.text.DecimalFormat;

@Component
public class PaymentInitiateResponseMapper {

    private final PayHereUtil payHereUtil;

    private final Environment environment;

    public PaymentInitiateResponseMapper(
        PayHereUtil payHereUtil,
        Environment environment
    ) {
        this.payHereUtil = payHereUtil;
        this.environment = environment;
    }

    public PaymentInitiateResponseDTO toPaymentInitiateResponseDTO(final Payment payment, final PaymentRequestDTO paymentRequestDTO) {
        if (payment == null) {
            return null;
        } else {
            final PaymentInitiateResponseDTO paymentInitiateResponseDTO = new PaymentInitiateResponseDTO();

            String amountFormatted = new DecimalFormat("0.00")
                    .format(paymentRequestDTO.getAmount());

            paymentInitiateResponseDTO.setOrderId(payment.getId());
            paymentInitiateResponseDTO.setHash(
                    payHereUtil.getPayHereHash(
                            payment.getId(),
                            amountFormatted,
                            "LKR"
                    )
            );
            paymentInitiateResponseDTO.setMerchantId(payHereUtil.getMerchantId());
            paymentInitiateResponseDTO.setItem("Doctor Appointment");
            paymentInitiateResponseDTO.setAmount(amountFormatted);
            paymentInitiateResponseDTO.setCurrency("LKR");
            // TODO: Use GET patient to add the correct details
            paymentInitiateResponseDTO.setFirstname("John");
            paymentInitiateResponseDTO.setLastname("Doe");
            paymentInitiateResponseDTO.setContactNumber("0771234567");
            paymentInitiateResponseDTO.setEmail("john@doe.com");
            // TODO:
            paymentInitiateResponseDTO.setNotifyUrl(payHereUtil.getNotifyUrl());

            return paymentInitiateResponseDTO;
        }
    }
}
