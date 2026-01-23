package com.tapalque.hosteleria.demo.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.hosteleria.demo.entidades.Habitacion;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    List<Habitacion> findByHospedajeId(Long hospedajeId);

    List<Habitacion> findByHospedajeIdAndDisponibleTrue(Long hospedajeId);

    long countByHospedajeIdAndDisponibleTrue(Long hospedajeId);
}
