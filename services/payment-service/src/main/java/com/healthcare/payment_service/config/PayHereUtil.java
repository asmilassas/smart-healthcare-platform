package com.healthcare.payment_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;

@Service
@ConfigurationProperties(prefix = "external.pay-here")
public class PayHereUtil {

    private String merchantId;
    private String merchantSecret;

    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;


    public String getPayHereHash(final String orderID, final String amount, final String currency) {

        return getMd5(merchantId + orderID + amount + currency + getMd5(merchantSecret));
    }

    public String getPayHereNotificationHash(final String orderID, final double amount, final String currency, final String statusCode) {
        final DecimalFormat df = new DecimalFormat("0.00");
        final String amountFormatted = df.format(amount);

        return getMd5(merchantId + orderID + amountFormatted + currency + statusCode + getMd5(merchantSecret));
    }

    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            BigInteger no = new BigInteger(1, messageDigest);
            String hashText = no.toString(16);
            while (hashText.length() < 32) {
                hashText = "0" + hashText;
            }
            return hashText.toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }
    public String getMerchantSecret() { return merchantSecret; }
    public void setMerchantSecret(String merchantSecret) { this.merchantSecret = merchantSecret; }

    public String getNotifyUrl()   { return notifyUrl; }
    public void setNotifyUrl(String notifyUrl) { this.notifyUrl = notifyUrl; }
    public String getReturnUrl()   { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    public String getCancelUrl()   { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
}
