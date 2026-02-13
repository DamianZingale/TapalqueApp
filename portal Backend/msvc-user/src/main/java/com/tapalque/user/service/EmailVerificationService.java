package com.tapalque.user.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.user.entity.User;
import com.tapalque.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final UserRepository userRepository;
    private static final int TOKEN_EXPIRATION_HOURS = 24;

    /**
     * Genera un token de verificación para el usuario
     */
    @Transactional
    public String generateVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));
        userRepository.save(user);
        return token;
    }

    /**
     * Verifica el token y activa la cuenta del usuario
     */
    @Transactional
    public boolean verifyEmail(String token) {
        return userRepository.findByVerificationToken(token)
                .map(user -> {
                    // Verificar si el token no ha expirado
                    if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                        return false; // Token expirado
                    }

                    // Activar la cuenta
                    user.setEmailVerified(true);
                    user.setVerificationToken(null);
                    user.setVerificationTokenExpiry(null);
                    userRepository.save(user);
                    return true;
                })
                .orElse(false); // Token no encontrado
    }

    /**
     * Reenvía el email de verificación
     */
    @Transactional
    public String resendVerificationToken(String email) {
        return userRepository.findByEmail(email)
                .filter(user -> !user.isEmailVerified())
                .map(this::generateVerificationToken)
                .orElse(null);
    }

    /**
     * Construye la URL de verificación para enviar por email
     */
    public String buildVerificationUrl(String token, String baseUrl) {
        return baseUrl + "/verify-email?token=" + token;
    }
}
