package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;  // ← NUEVO
import com.tapalque.user.entity.Role;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")  // ← CORREGIDO: sin /api
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/public/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            Role role = new Role(3L, RolName.USER);
            UserResponseDTO response = userService.register(dto, role);  // ← UserResponseDTO
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @PostMapping("/AdminRegistro")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            Role role = new Role(1L, RolName.MODERADOR);
            UserResponseDTO response = userService.register(dto, role);  // ← UserResponseDTO
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
           return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/GastroRegistro")
    public ResponseEntity<?> registerGastro(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            Role role = new Role(2L, RolName.ADMINISTRADOR);
            UserResponseDTO response = userService.register(dto, role);  // ← UserResponseDTO
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }



    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}