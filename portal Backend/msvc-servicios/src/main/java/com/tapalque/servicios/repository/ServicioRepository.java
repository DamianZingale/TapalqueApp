package com.tapalque.servicios.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.servicios.entity.Servicio;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long>{
    
}
