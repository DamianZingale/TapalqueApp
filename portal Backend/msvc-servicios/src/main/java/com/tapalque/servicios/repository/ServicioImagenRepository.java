package com.tapalque.servicios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.servicios.entity.ServicioImagen;

@Repository
public interface ServicioImagenRepository extends JpaRepository<ServicioImagen, Long> {
    List<ServicioImagen> findByServicio_Id(Long servicioId);

    int deleteByServicio_IdAndImagenUrl(Long servicioId, String imagenUrl);

    Optional<ServicioImagen> findByServicio_IdAndImagenUrl(Long servicioId, String imagenUrl);
}
