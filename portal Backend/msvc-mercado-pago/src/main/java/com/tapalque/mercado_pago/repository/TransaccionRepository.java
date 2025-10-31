package com.tapalque.mercado_pago.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.mercado_pago.entity.Transaccion;


public interface TransaccionRepository extends JpaRepository<Transaccion, Long>{
    
}
