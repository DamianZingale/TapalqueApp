package com.tapalque.termas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.termas.entity.Terma;

@Repository
public interface TermaRepository extends JpaRepository<Terma, Long>{
    
}
