package com.tapalque.user.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;  // ← NUEVO
import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.repository.UserRepository;
import com.tapalque.user.util.PasswordValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    public UserResponseDTO register(UserRegistrationDTO dto, Role role) {  // ← Retorna UserResponseDTO
        // Validar fortaleza de contraseña
        PasswordValidator.validate(dto.getPassword());

        // Verificar si el email ya existe
        if (userRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        // Encriptar contraseña
        String encoded = passwordEncoder.encode(dto.getPassword());

        // Crear usuario (sin verificar email por defecto)
        User user = User.builder()
                .email(dto.getEmail())
                .password(encoded)
                .firstName(dto.getFirtName())
                .registrationDate(LocalDateTime.now())
                .role(role)
                .build();

        user.setEmailVerified(false); // Por defecto no verificado
        userRepo.save(user);

        // Generar token de verificación
        String verificationToken = emailVerificationService.generateVerificationToken(user);

        // Enviar email de verificación
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
        } catch (Exception e) {
            // Log del error pero no fallar el registro
            System.err.println("Error al enviar email de verificación: " + e.getMessage());
            // El token se imprime en consola como fallback
            System.out.println("Token de verificación para " + user.getEmail() + ": " + verificationToken);
        }

        return UserResponseDTO.fromEntity(user);  // ← Sin password
    }

    public Boolean getByEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }

    public java.util.Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .map(UserResponseDTO::fromEntity);
    }

    // Para uso interno en autenticación - incluye password
    public java.util.Optional<User> getUserByEmailWithPassword(String email) {
        return userRepo.findByEmail(email);
    }
}