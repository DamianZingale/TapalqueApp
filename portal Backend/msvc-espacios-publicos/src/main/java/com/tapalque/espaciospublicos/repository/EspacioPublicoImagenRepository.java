package com.tapalque.espaciospublicos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.espaciospublicos.entity.EspacioPublicoImagen;

public interface EspacioPublicoImagenRepository extends JpaRepository<EspacioPublicoImagen, Long> {
    Optional<EspacioPublicoImagen> findByImagenUrlAndEspacioPublicoId(String imagenUrl, Long espacioPublicoId);
}
