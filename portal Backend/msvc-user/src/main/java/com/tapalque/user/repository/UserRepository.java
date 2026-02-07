package com.tapalque.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String nombreDeUsuario);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);
}
