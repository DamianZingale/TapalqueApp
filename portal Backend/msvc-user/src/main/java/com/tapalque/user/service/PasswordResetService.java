package com.tapalque.user.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.user.entity.User;
import com.tapalque.user.repository.UserRepository;
import com.tapalque.user.util.PasswordValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int TOKEN_EXPIRATION_HOURS = 1; // Token válido por 1 hora

    /**
     * Genera un token de reset de contraseña para el usuario
     * @return El token generado o null si el email no existe
     */
    @Transactional
    public String generatePasswordResetToken(String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    user.setPasswordResetToken(token);
                    user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));
                    userRepository.save(user);
                    return token;
                })
                .orElse(null);
    }

    /**
     * Valida si un token de reset es válido y no ha expirado
     */
    public boolean isValidResetToken(String token) {
        return userRepository.findByPasswordResetToken(token)
                .map(user -> user.getPasswordResetTokenExpiry() != null
                        && user.getPasswordResetTokenExpiry().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    /**
     * Obtiene el usuario por su token de reset
     */
    public Optional<User> getUserByResetToken(String token) {
        return userRepository.findByPasswordResetToken(token)
                .filter(user -> user.getPasswordResetTokenExpiry() != null
                        && user.getPasswordResetTokenExpiry().isAfter(LocalDateTime.now()));
    }

    /**
     * Resetea la contraseña del usuario usando el token
     * @return true si el reset fue exitoso, false si el token es inválido
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        return userRepository.findByPasswordResetToken(token)
                .map(user -> {
                    // Verificar si el token no ha expirado
                    if (user.getPasswordResetTokenExpiry() == null
                            || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
                        return false; // Token expirado
                    }

                    // Validar fortaleza de contraseña
                    PasswordValidator.validate(newPassword);

                    // Actualizar contraseña
                    user.setPassword(passwordEncoder.encode(newPassword));

                    // Limpiar token de reset
                    user.setPasswordResetToken(null);
                    user.setPasswordResetTokenExpiry(null);

                    userRepository.save(user);
                    return true;
                })
                .orElse(false); // Token no encontrado
    }
}
