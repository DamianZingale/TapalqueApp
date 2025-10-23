package com.tapalque.jwt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.jwt.entity.Token;
//importaciones para la limpieza
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;


public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByToken(String jwt);

List<Token> findByUsuarioIdAndExpiredFalseAndRevokedFalse(Long id);

List<Token> findByRevokedFalseAndExpiredFalse();

@Modifying
@Query("DELETE FROM Token t WHERE t.expired = true OR t.revoked = true")
void deleteAllExpiredOrRevoked();
}

