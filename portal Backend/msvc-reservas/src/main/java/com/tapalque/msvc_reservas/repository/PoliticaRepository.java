package com.tapalque.msvc_reservas.repository;

import com.tapalque.msvc_reservas.entity.PoliticaGlobal;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface PoliticaRepository extends ReactiveMongoRepository<PoliticaGlobal, String> {
    Mono<PoliticaGlobal> findByHotelId(String hotelId);
}
