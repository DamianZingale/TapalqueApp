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

    public UserResponseDTO register(UserRegistrationDTO dto, Role role) {  // ← Retorna UserResponseDTO
        // Validar fortaleza de contraseña
        PasswordValidator.validate(dto.getPassword());
        
        // Verificar si el email ya existe
        if (userRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        // Encriptar contraseña
        String encoded = passwordEncoder.encode(dto.getPassword());
        
        // Crear usuario
        User user = User.builder()
                .email(dto.getEmail())
                .password(encoded)
                .firstName(dto.getFirtName())
                .registrationDate(LocalDateTime.now())
                .role(role)
                .build();

        userRepo.save(user);

        return UserResponseDTO.fromEntity(user);  // ← Sin password
    }

    public Boolean getByEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }
}