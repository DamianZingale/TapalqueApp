package com.tapalque.msvc_pedidos.service;

import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.mongodb.lang.NonNull;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    
    public void notificarInitPointAlUsuario(@NonNull String idCliente, @NonNull String initPoint) {
        Map<String, String> payload = Map.of(
            "tipo", "INIT_POINT",
            "url", initPoint
        );

        messagingTemplate.convertAndSendToUser(
            idCliente,
            "/queue/pagos",
            (Object) payload
        );
    }

    
    public void notificarEstadoPagoAlUsuario(@NonNull String idCliente, @NonNull String estado) {
        Map<String, String> payload = Map.of(
            "tipo", "ESTADO_PAGO",
            "estado", estado
        );

        messagingTemplate.convertAndSendToUser(
            idCliente,
            "/queue/pagos",
            (Object) payload
        );
    }
}
