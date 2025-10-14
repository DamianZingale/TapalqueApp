package com.tapalque.jwt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.jwt.entity.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByToken(String jwt);

List<Token> findByUsuarioIdAndExpiredFalseAndRevokedFalse(Long id);

List<Token> findByRevokedFalseAndExpiredFalse();
}

