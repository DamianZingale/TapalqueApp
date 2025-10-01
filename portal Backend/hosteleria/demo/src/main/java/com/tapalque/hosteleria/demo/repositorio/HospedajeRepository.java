package com.tapalque.hosteleria.demo.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.hosteleria.demo.entidades.Hospedaje;

@Repository
public interface HospedajeRepository extends JpaRepository<Hospedaje, Long> {
}
