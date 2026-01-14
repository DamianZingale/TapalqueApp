package com.tapalque.hosteleria.demo.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;

@Repository
public interface HospedajeImagenRepository extends JpaRepository<HospedajeImagen, Long> {
    List<HospedajeImagen> findByHospedajeId(Long hospedajeId);
    Optional<HospedajeImagen> findByHospedajeIdAndImagenUrl(Long hospedajeId, String imagenUrl);
}
