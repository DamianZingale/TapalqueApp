package com.tapalque.user.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tapalque.user.dto.UserRequestDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.RoleRepository;
import com.tapalque.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO register(UserRequestDTO dto) {
        if (userRepo.findByEmail(dto.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        Role role = new Role(1L, RolName.ADMIN_GENERAL);
        String encoded = passwordEncoder.encode(dto.getContrasena());
        User user = User.builder()
                .email(dto.getCorreo())
                .password(encoded)
                .firtName(dto.getNombre())
                .lastName(dto.getApellido())
                .nameEmprise(dto.getEmpresa())
                .registrationDate(LocalDateTime.now())
                .role(role)
                .build();

        userRepo.save(user);

        return mapToDTO(user);
    }

    public UserResponseDTO getByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapToDTO(user);
    }

    private UserResponseDTO mapToDTO(User user) {
        return UserResponseDTO.builder()
                .email(user.getEmail())
                .contrasena(user.getPassword())
                .firtName(user.getFirtName())
                .lastName(user.getLastName())
                .nameEmprise(user.getNameEmprise())
                .rol(user.getRole().getName())
                .build();
    }
}