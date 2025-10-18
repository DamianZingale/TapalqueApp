package com.tapalque.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.UserRequestDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registrar(@RequestBody UserRequestDTO dto) {
        User user = userService.registrarUsuario(dto, RolName.ADMIN_GENERAL); // o dinámico
        UserResponseDTO response = mapToDTO(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserResponseDTO> obtener(@PathVariable String email) {
        User user = userService.getByEmail(email);
        return ResponseEntity.ok(mapToDTO(user));
    }

    private UserResponseDTO mapToDTO(User usuario) {
        return UserResponseDTO.builder()
                .email(usuario.getEmail())
                .lastName(usuario.getLastName())
                .firtName(usuario.getFirtName())
                .nameEmprise(usuario.getNameEmprise())
                .rol(usuario.getRole().getName())
                .build();
    }
}