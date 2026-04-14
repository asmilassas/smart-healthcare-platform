package com.healthcare.payment_service.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PayHereCallbackDTO {

    @JsonProperty("merchant_id")
    private String merchantId;

    // paymentId
    @JsonProperty("order_id")
    private String orderId;

    // PayHere's own Id
    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("payhere_amount")
    private String payhereAmount;

    @JsonProperty("payhere_currency")
    private String payhereCurrency;

    @JsonProperty("status_code")
    private String statusCode;

    // used for signature verification
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
