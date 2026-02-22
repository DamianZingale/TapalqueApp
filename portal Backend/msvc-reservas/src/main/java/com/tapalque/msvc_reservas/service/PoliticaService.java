package com.tapalque.msvc_reservas.service;

import com.tapalque.msvc_reservas.entity.PoliticaGlobal;
import reactor.core.publisher.Mono;

public interface PoliticaService {
    Mono<PoliticaGlobal> obtenerPolitica(String hotelId);
    Mono<PoliticaGlobal> actualizarPolitica(String hotelId, Boolean reservasHabilitadas, Boolean politicaFdsActiva, String actualizadoPor);
}
