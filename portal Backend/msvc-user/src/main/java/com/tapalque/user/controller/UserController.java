package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.Map;

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
import com.tapalque.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDTO dto) {
        try {
            UserResponseDTO response = userService.register(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getByEmail(@PathVariable String email) {
        try {
            UserResponseDTO response = userService.getByEmail(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Usuario no encontrado", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}