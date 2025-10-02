package com.tapalque.comercio.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.comercio.entity.ComercioImagen;

@Repository
public interface ComercioImagenRepository extends JpaRepository<ComercioImagen, Long> {
    List<ComercioImagen> findByComercio_Id(Long comercioId);

    int deleteByComercio_IdAndImagenUrl(Long comercioId, String imagenUrl);

    Optional<ComercioImagen> findByComercio_IdAndImagenUrl(Long comercioId, String imagenUrl);
}
