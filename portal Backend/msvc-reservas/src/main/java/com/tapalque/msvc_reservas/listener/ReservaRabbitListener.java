package com.tapalque.msvc_reservas.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tapalque.msvc_reservas.dto.PagoEventoDTO;
import com.tapalque.msvc_reservas.service.ReservationService;

@Component
public class ReservaRabbitListener {

    @Autowired
    private ReservationService reservationService;

    @RabbitListener(queues = "pagos.reservas")
    public void recibirPagoReserva(PagoEventoDTO evento) {
        try {
            System.out.println("Recibido evento de pago para reserva ID: " + evento.getReferenciaId());

            if ("APROBADO".equals(evento.getEstado())) {
                reservationService.confirmarPagoReserva(evento.getReferenciaId(), evento);
            } else if ("RECHAZADO".equals(evento.getEstado())) {
                reservationService.rechazarPagoReserva(evento.getReferenciaId(), evento);
            } else if ("PENDIENTE".equals(evento.getEstado())) {
                reservationService.marcarPagoPendienteReserva(evento.getReferenciaId(), evento);
            }

            System.out.println("Reserva ID " + evento.getReferenciaId() + " actualizada con estado: " + evento.getEstado());
        } catch (Exception e) {
            System.err.println("Error al procesar evento de pago reserva: " + e.getMessage());
            throw e; // Para reintento automático
        }
    }
}
