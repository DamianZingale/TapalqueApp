package com.tapalque.msvc_reservas.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.tapalque.msvc_reservas.entity.PoliticaGlobal;
import com.tapalque.msvc_reservas.repository.PoliticaRepository;

import reactor.core.publisher.Mono;

@Service
public class PoliticaServiceImpl implements PoliticaService {

    private final PoliticaRepository politicaRepository;

    public PoliticaServiceImpl(PoliticaRepository politicaRepository) {
        this.politicaRepository = politicaRepository;
    }

    @Override
    public Mono<PoliticaGlobal> obtenerPolitica(String hotelId) {
        return politicaRepository.findByHotelId(hotelId)
                .switchIfEmpty(crearPoliticaDefecto(hotelId));
    }

    @Override
    public Mono<PoliticaGlobal> actualizarPolitica(String hotelId, Boolean reservasHabilitadas, Boolean politicaFdsActiva, String actualizadoPor) {
        return obtenerPolitica(hotelId)
                .flatMap(politica -> {
                    if (reservasHabilitadas != null) politica.setReservasHabilitadas(reservasHabilitadas);
                    if (politicaFdsActiva != null) politica.setPoliticaFdsActiva(politicaFdsActiva);
                    politica.setFechaActualizacion(LocalDateTime.now());
                    politica.setActualizadoPor(actualizadoPor);
                    return politicaRepository.save(politica);
                });
    }

    private Mono<PoliticaGlobal> crearPoliticaDefecto(String hotelId) {
        PoliticaGlobal defecto = new PoliticaGlobal();
        defecto.setHotelId(hotelId);
        defecto.setFechaActualizacion(LocalDateTime.now());
        return politicaRepository.save(defecto);
    }
}
