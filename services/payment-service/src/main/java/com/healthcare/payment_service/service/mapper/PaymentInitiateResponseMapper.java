package com.healthcare.payment_service.service.mapper;

import com.healthcare.payment_service.client.PatientServiceClient;
import com.healthcare.payment_service.client.dto.PatientDTO;
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

    private final PatientServiceClient patientServiceClient;

    public PaymentInitiateResponseMapper(
        PayHereUtil payHereUtil,
        Environment environment,
        PatientServiceClient patientServiceClient
    ) {
        this.payHereUtil = payHereUtil;
        this.environment = environment;
        this.patientServiceClient = patientServiceClient;
    }

    public PaymentInitiateResponseDTO toPaymentInitiateResponseDTO(final Payment payment, final PaymentRequestDTO paymentRequestDTO) {
        if (payment == null) {
            return null;
        } else {
            final PaymentInitiateResponseDTO paymentInitiateResponseDTO = new PaymentInitiateResponseDTO();

            String amountFormatted = new DecimalFormat("0.00")
                    .format(paymentRequestDTO.getAmount());

            String baseReturnUrl = environment.getProperty("external.pay-here.return-url");
            String baseCancelUrl = environment.getProperty("external.pay-here.cancel-url");

            if (baseReturnUrl == null || baseCancelUrl == null) {
                throw new IllegalStateException("PayHere return/cancel URLs are not configured");
            }

            String appointmentId = paymentRequestDTO.getAppointmentId();

            String returnUrl = baseReturnUrl + "?appointmentId=" + appointmentId;
            String cancelUrl = baseCancelUrl + "?appointmentId=" + appointmentId + "&cancelled=true";

            // Fetch patient details
            PatientDTO patient = patientServiceClient.getPatientById(
                    paymentRequestDTO.getPatientId()
            );

            if (patient == null) {
                throw new IllegalStateException("Patient not found");
            }

            String fullName = patient.getFullName();

            String firstName = "";
            String lastName = "";

            if (fullName != null && !fullName.trim().isEmpty()) {
                String trimmedName = fullName.trim();

                int firstSpaceIndex = trimmedName.indexOf(" ");

                if (firstSpaceIndex == -1) {
                    // Only one name
                    firstName = trimmedName;
                } else {
                    firstName = trimmedName.substring(0, firstSpaceIndex);
                    lastName = trimmedName.substring(firstSpaceIndex + 1);
                }
            }

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

            paymentInitiateResponseDTO.setFirstname(firstName);
            paymentInitiateResponseDTO.setLastname(lastName);
            paymentInitiateResponseDTO.setContactNumber(patient.getPhone());
            paymentInitiateResponseDTO.setEmail(patient.getEmail());

//            paymentInitiateResponseDTO.setFirstname("John");
//            paymentInitiateResponseDTO.setLastname("Doe");
//            paymentInitiateResponseDTO.setContactNumber("0771234567");
//            paymentInitiateResponseDTO.setEmail("john@doe.com");

            paymentInitiateResponseDTO.setNotifyUrl(payHereUtil.getNotifyUrl());
            paymentInitiateResponseDTO.setReturnUrl(returnUrl);
            paymentInitiateResponseDTO.setCancelUrl(cancelUrl);


            return paymentInitiateResponseDTO;
        }
    }
}
