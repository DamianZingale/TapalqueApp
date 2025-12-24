package com.tapalque.msvc_reservas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tapalque.msvc_reservas.repository.ReservationRepositoryInterface;

public class RabbitMQListenerService {

    private Logger logger = LoggerFactory.getLogger(RabbitMQListenerService.class);

    private final ReservationRepositoryInterface reservaRepository;

    public RabbitMQListenerService(ReservationRepositoryInterface reservaRepository) {
        this.reservaRepository = reservaRepository;
    }
/*
    @RabbitListener(queues = "pagos-hospedajes-queue")
    public void recibirPago(Map<String, Object> mensaje) {
        logger.info("Pago recibido en msvc-reservas: {}", mensaje);

        String idReserva = mensaje.get("idTransaccion").toString();
        String estadoPago = mensaje.get("estado").toString();

        reservaRepository.findById(idReserva).ifPresentOrElse(reserva -> {
            reserva.setEstadoPago(estadoPago);
            reservaRepository.save(reserva);
            logger.info("Reserva actualizada con estado de pago: {}", idReserva);
        }, () -> {
            logger.warn("No se encontró la reserva con ID: {}", idReserva);
        });
    }
  */
}
