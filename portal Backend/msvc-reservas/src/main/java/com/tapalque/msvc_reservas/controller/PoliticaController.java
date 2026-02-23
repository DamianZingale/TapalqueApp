package com.tapalque.msvc_reservas.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.msvc_reservas.entity.PoliticaGlobal;
import com.tapalque.msvc_reservas.service.PoliticaService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/politica")
public class PoliticaController {

    private final PoliticaService politicaService;

    public PoliticaController(PoliticaService politicaService) {
        this.politicaService = politicaService;
    }

    @GetMapping("/{hotelId}")
    public Mono<PoliticaGlobal> obtenerPolitica(@PathVariable String hotelId) {
        return politicaService.obtenerPolitica(hotelId);
    }

    @PutMapping("/{hotelId}")
    public Mono<PoliticaGlobal> actualizarPolitica(@PathVariable String hotelId, @RequestBody PoliticaGlobal body) {
        return politicaService.actualizarPolitica(
                hotelId,
                body.getReservasHabilitadas(),
                body.getPoliticaFdsActiva(),
                body.getEstadiaMinima(),
                body.getActualizadoPor()
        );
    }
}
