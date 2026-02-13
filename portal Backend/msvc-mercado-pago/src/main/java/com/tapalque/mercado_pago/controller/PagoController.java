package com.tapalque.mercado_pago.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import com.tapalque.mercado_pago.dto.ProductoRequestDTO;
import com.tapalque.mercado_pago.dto.WebhookDTO;
import com.tapalque.mercado_pago.service.MercadoPagoService;
import com.tapalque.mercado_pago.util.WebhookSignatureValidator;


@RestController
@RequestMapping("/mercadopago")
public class PagoController {
    private final MercadoPagoService mercadoPagoService;
    private final WebhookSignatureValidator signatureValidator;

    @Value("${mercadopago.access-token}")
    private String accessToken;

    public PagoController(MercadoPagoService mercadoPagoService, WebhookSignatureValidator signatureValidator) {
        this.mercadoPagoService = mercadoPagoService;
        this.signatureValidator = signatureValidator;
    }

    // Endpoint temporal para activar la app en producción
    @GetMapping("/test-payment")
    public ResponseEntity<?> crearPagoTest() {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Pago de prueba - Activación TapalqueApp")
                    .quantity(1)
                    .currencyId("ARS")
                    .unitPrice(new BigDecimal("10.00"))
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return ResponseEntity.ok(preference.getInitPoint());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/pagos/crear")
    public ResponseEntity<?> crearPago(@RequestBody ProductoRequestDTO request) {
        try {
            String initPoint = mercadoPagoService.crearPreferencia(request);
            return ResponseEntity.ok(initPoint);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al crear preferencia: " + e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(
            @RequestBody WebhookDTO webhook,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {
        try {
            // Validar firma del webhook
            String dataId = webhook.getData() != null ? String.valueOf(webhook.getData().getId()) : null;
            if (!signatureValidator.validarFirma(xSignature, xRequestId, dataId)) {
                System.out.println("[Webhook] Firma invalida, rechazando notificacion.");
                return ResponseEntity.status(401).body("Firma invalida");
            }

            mercadoPagoService.procesarWebhook(webhook);
            return ResponseEntity.ok("Webhook procesado");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error procesando webhook: " + e.getMessage());
        }
    }
}
