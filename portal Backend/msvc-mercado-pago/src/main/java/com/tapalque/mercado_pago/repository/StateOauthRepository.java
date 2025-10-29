package com.tapalque.mercado_pago.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.mercado_pago.entity.StateOauth;

public interface StateOauthRepository extends JpaRepository<StateOauth, Long> {
    Optional<StateOauth> findByState(String state);
}
