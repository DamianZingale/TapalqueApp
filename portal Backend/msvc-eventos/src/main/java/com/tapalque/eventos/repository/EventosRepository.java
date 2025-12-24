package com.tapalque.eventos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.eventos.entity.Eventos;

@Repository
public interface EventosRepository extends JpaRepository<Eventos, Long> {

}
