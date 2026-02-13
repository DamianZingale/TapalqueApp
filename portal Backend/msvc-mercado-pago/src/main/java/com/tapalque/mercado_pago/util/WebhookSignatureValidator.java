package com.tapalque.mercado_pago.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WebhookSignatureValidator {

    @Value("${mercadopago.webhook-secret:}")
    private String webhookSecret;

    /**
     * Valida la firma del webhook de Mercado Pago.
     *
     * MP envia el header x-signature con formato: ts=TIMESTAMP,v1=HASH
     * El HASH se calcula con HMAC-SHA256 sobre el template:
     * id:{data.id};request-id:{x-request-id};ts:{timestamp};
     *
     * @param xSignature    header x-signature
     * @param xRequestId    header x-request-id
     * @param dataId        data.id del body del webhook
     * @return true si la firma es valida o si no hay secret configurado (dev mode)
     */
    public boolean validarFirma(String xSignature, String xRequestId, String dataId) {
        // Si no hay secret configurado, saltear validacion (modo desarrollo)
        if (webhookSecret == null || webhookSecret.isBlank()) {
            System.out.println("[Webhook] Sin webhook secret configurado, salteando validacion de firma.");
            return true;
        }

        if (xSignature == null || xSignature.isBlank()) {
            System.out.println("[Webhook] Header x-signature ausente.");
            return false;
        }

        try {
            // Extraer ts y v1 del header: "ts=123456,v1=abcdef..."
            String ts = null;
            String v1 = null;
            for (String part : xSignature.split(",")) {
                String trimmed = part.trim();
                if (trimmed.startsWith("ts=")) {
                    ts = trimmed.substring(3);
                } else if (trimmed.startsWith("v1=")) {
                    v1 = trimmed.substring(3);
                }
            }

            if (ts == null || v1 == null) {
                System.out.println("[Webhook] Formato de x-signature invalido: " + xSignature);
                return false;
            }

            // Construir el manifest: id:{dataId};request-id:{xRequestId};ts:{ts};
            StringBuilder manifest = new StringBuilder();
            if (dataId != null && !dataId.isBlank()) {
                manifest.append("id:").append(dataId).append(";");
            }
            if (xRequestId != null && !xRequestId.isBlank()) {
                manifest.append("request-id:").append(xRequestId).append(";");
            }
            manifest.append("ts:").append(ts).append(";");

            // Calcular HMAC-SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(webhookSecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(manifest.toString().getBytes());

            // Convertir a hex
            StringBuilder hexHash = new StringBuilder();
            for (byte b : hmacBytes) {
                hexHash.append(String.format("%02x", b));
            }

            boolean valido = hexHash.toString().equals(v1);
            if (!valido) {
                System.out.println("[Webhook] Firma invalida. Esperado: " + v1 + ", Calculado: " + hexHash);
            }
            return valido;

        } catch (Exception e) {
            System.out.println("[Webhook] Error validando firma: " + e.getMessage());
            return false;
        }
    }
}
