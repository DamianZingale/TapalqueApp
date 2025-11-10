package com.tapalque.jwt.controller;

import java.util.Map;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.jwt.service.JwtService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jwt")
@RequiredArgsConstructor
public class ValidateController {

    private final JwtService jwtService;

    @PostMapping("/validate")
    public ResponseEntity<?> validarToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
        }

        Claims claims = jwtService.extractAllClaims(token);
        String email = claims.getSubject();
        String rol = claims.get("rol", String.class);

        return ResponseEntity.ok(Map.of("email", email, "rol", rol));
    }
}