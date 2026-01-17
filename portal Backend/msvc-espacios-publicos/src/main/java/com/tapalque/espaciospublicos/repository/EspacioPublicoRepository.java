package com.tapalque.espaciospublicos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.espaciospublicos.entity.EspacioPublico;

public interface EspacioPublicoRepository extends JpaRepository<EspacioPublico, Long> {
    List<EspacioPublico> findByCategoria(String categoria);
}
