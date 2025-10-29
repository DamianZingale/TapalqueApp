package com.tapalque.mercado_pago.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.tapalque.mercado_pago.dto.EstadoUsuarioDTO;
import com.tapalque.mercado_pago.dto.PagoNotificacionDTO;


@Service
public class NotificacionService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificacionService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notificarPagoAUsuario(String nombreDeUsuario, PagoNotificacionDTO dto) {
        messagingTemplate.convertAndSendToUser(
                nombreDeUsuario,// nombre del usuario autenticado (del JWT)
                "/queue/pagos",// destino STOMP que escucha el frontend
                dto
        );
    }

    public void notificarFechaSuscripcionAUsuario(String nombreDeUsuario, EstadoUsuarioDTO dto) {
        messagingTemplate.convertAndSendToUser(
                nombreDeUsuario,// nombre del usuario autenticado (del JWT)
                "/queue/usuario",// destino STOMP que escucha el frontend
                dto
        );
    }
}