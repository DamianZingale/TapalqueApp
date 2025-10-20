package com.tapalque.jwt.controller;

import org.apache.hc.core5.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.jwt.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jwt")
@RequiredArgsConstructor
public class ValidateController {

    private final JwtService jwtService;

    @PostMapping("/validate")
    public ResponseEntity<Void> validarToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        boolean valido = jwtService.isTokenValid(token);
        return valido ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).build();
    }
}