package com.tapalque.msvc_reservas.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.dto.ReservationDTO;

@Service
public class AdminNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public AdminNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notificarNuevaReserva(ReservationDTO reserva) {
        String hotelId = reserva.getHotel() != null
                ? reserva.getHotel().getHotelId()
                : null;
        if (hotelId == null) return;

        messagingTemplate.convertAndSend(
                "/topic/reservas/" + hotelId,
                Map.of(
                        "type", "reserva:nueva",
                        "payload", reserva,
                        "businessId", hotelId,
                        "businessType", "HOSPEDAJE",
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }

    public void notificarReservaActualizada(ReservationDTO reserva) {
        String hotelId = reserva.getHotel() != null
                ? reserva.getHotel().getHotelId()
                : null;
        if (hotelId == null) return;

        messagingTemplate.convertAndSend(
                "/topic/reservas/" + hotelId,
                Map.of(
                        "type", "reserva:actualizada",
                        "payload", reserva,
                        "businessId", hotelId,
                        "businessType", "HOSPEDAJE",
                        "timestamp", LocalDateTime.now().toString()
                )
        );
    }
}
