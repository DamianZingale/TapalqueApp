package com.tapalque.jwt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.jwt.entity.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByEmailAndExpiredFalseAndRevokedFalse(String email);

    Optional<Token> findByToken(String token);

}
