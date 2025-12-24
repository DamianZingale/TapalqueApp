package com.tapalque.mercado_pago.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.mercado_pago.dto.WebhookDTO;
import com.tapalque.mercado_pago.service.MercadoPagoService;


@RestController
@RequestMapping("/api")
public class PagoController {
    private final MercadoPagoService mercadoPagoService;

    public PagoController(MercadoPagoService mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }
    /* SUSTITUIDO POR RABBITMQ
    @PostMapping("/pagos/crear")
    public ResponseEntity<?> crearPago(@RequestBody ProductoRequestDTO request) {
        try {
            String initPoint = mercadoPagoService.crearPreferencia(request);
            return ResponseEntity.ok(initPoint);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al crear preferencia: " + e.getMessage());
        }
    } */

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(@RequestBody WebhookDTO webhook) {
        try {
            mercadoPagoService.procesarWebhook(webhook);
            return ResponseEntity.ok("Webhook procesado");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error procesando webhook: " + e.getMessage());
        }
    }
}