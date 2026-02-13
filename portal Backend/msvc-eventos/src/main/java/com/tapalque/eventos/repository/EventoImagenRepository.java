package com.tapalque.eventos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.eventos.entity.EventoImagen;

@Repository
public interface EventoImagenRepository extends JpaRepository<EventoImagen, Long> {
    List<EventoImagen> findByEvento_Id(Long eventoId);

    int deleteByEvento_IdAndImagenUrl(Long eventoId, String imagenUrl);

    Optional<EventoImagen> findByEvento_IdAndImagenUrl(Long eventoId, String imagenUrl);
}
