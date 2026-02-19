package com.tapalque.msvc_reservas.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Service
public class MercadoPagoClient {

    private final WebClient webClient;

    public MercadoPagoClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("lb://msvc-mercado-pago").build();
    }

    /**
     * Solicita un reembolso en Mercado Pago para el pago indicado.
     * POST /mercadopago/reembolsar/{mercadoPagoId}
     */
    public Mono<Void> reembolsar(String mercadoPagoId) {
        return webClient.post()
                .uri("/mercadopago/reembolsar/{id}", mercadoPagoId)
                .retrieve()
                .onStatus(status -> status.isError(),
                        resp -> resp.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException("Error al reembolsar: " + body))))
                .bodyToMono(Void.class);
    }
}
