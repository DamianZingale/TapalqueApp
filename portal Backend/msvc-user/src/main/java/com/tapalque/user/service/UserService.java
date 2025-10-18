package com.tapalque.user.service;

import org.springframework.stereotype.Service;

import com.tapalque.user.dto.UserRequestDTO;
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

    public User registrarUsuario(UserRequestDTO dto, RolName rolNombre) {
        Role rol = roleRepo.findByNombre(rolNombre)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        User usuario = User.builder()
                .email(dto.getCorreo())
                .password(dto.getContrasena()) // encripta en MSVC JWT
                .firtName(dto.getNombre())
                .lastName(dto.getApellido())
                .nameEmprise(dto.getEmpresa())
                .role(rol)
                .build();

        return userRepo.save(usuario);
    }

    public User getByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}