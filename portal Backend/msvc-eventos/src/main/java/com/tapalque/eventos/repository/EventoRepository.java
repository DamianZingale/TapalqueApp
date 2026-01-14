package com.tapalque.eventos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.eventos.entity.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByFechaFinBefore(LocalDate fecha);
    List<Evento> findByFechaFinIsNullAndFechaInicioBefore(LocalDate fecha);
}
