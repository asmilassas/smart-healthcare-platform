package com.healthcare.payment_service.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PayHereCallbackDTO {

    @NotBlank(message = "Merchant ID is required")
    @JsonProperty("merchant_id")
    private String merchantId;

    // paymentId
    @NotBlank(message = "Order ID is required")
    @JsonProperty("order_id")
    private String orderId;

    // PayHere's own Id
    @NotBlank(message = "PayHere Payment ID is required")
    @JsonProperty("payment_id")
    private String paymentId;

    @NotBlank(message = "Amount is required")
    @JsonProperty("payhere_amount")
    private String payhereAmount;

    @NotBlank(message = "Currency is required")
    @JsonProperty("payhere_currency")
    private String payhereCurrency;

    @NotBlank(message = "Status code is required")
    @JsonProperty("status_code")
    private String statusCode;

    // used for signature verification
    @NotBlank(message = "Signature is required")
    @JsonProperty("md5sig")
    private String md5sig;

    // Getters & Setters
    public String getMerchantId() {
        return merchantId;
    }
    public void setMerchantId(String merchantId) {
        this.merchantId = merchantId;
    }

    public String getOrderId() {
        return orderId;
    }
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getPaymentId() {
        return paymentId;
    }
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getPayhereAmount() {
        return payhereAmount;
    }
    public void setPayhereAmount(String payhereAmount) {
        this.payhereAmount = payhereAmount;
    }

    public String getPayhereCurrency() {
        return payhereCurrency;
    }
    public void setPayhereCurrency(String payhereCurrency) {
        this.payhereCurrency = payhereCurrency;
    }

    public String getStatusCode() {
        return statusCode;
    }
    public void setStatusCode(String statusCode) {
        this.statusCode = statusCode;
    }

    public String getMd5sig() {
        return md5sig;
    }
    public void setMd5sig(String md5sig) {
        this.md5sig = md5sig;
    }
}
