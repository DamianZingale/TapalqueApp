package com.tapalque.comercio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.comercio.entity.Comercio;

@Repository
public interface ComercioRepository extends JpaRepository<Comercio, Long>{
    
}
