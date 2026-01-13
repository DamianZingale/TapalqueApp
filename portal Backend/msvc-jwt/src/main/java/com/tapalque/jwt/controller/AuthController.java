package com.tapalque.jwt.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.jwt.dto.AuthRequestDTO;
import com.tapalque.jwt.dto.TokenResponse;
import com.tapalque.jwt.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/jwt/public")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequestDTO request) {
        try {
            TokenResponse response = service.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Error en login", e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) final String authHeader) {
        try {
            TokenResponse response = service.refreshToken(authHeader);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Token inválido", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}