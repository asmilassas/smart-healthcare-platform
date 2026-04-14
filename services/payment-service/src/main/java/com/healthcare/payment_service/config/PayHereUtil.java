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

    private String merchantID;
    private String merchantSecret;

    public String getPayHereNotificationHash(final String orderID, final double amount, final String currency, final String statusCode) {
        final DecimalFormat df = new DecimalFormat("0.00");
        final String amountFormatted = df.format(amount);

        return getMd5(merchantID + orderID + amountFormatted + currency + statusCode + getMd5(merchantSecret));
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
}
