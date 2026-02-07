package com.tapalque.jwt.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.jwt.dto.AuthRequestDTO;
import com.tapalque.jwt.dto.TokenResponse;
import com.tapalque.jwt.service.AuthService;
import com.tapalque.jwt.service.LoginAttemptService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/jwt/public")
public class AuthController {

    private final AuthService service;
    private final LoginAttemptService loginAttemptService;

    public AuthController(AuthService service, LoginAttemptService loginAttemptService) {
        this.service = service;
        this.loginAttemptService = loginAttemptService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequestDTO request, HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);

        if (loginAttemptService.isBlocked(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", "300")
                    .body(error("Demasiados intentos",
                            "Tu IP ha sido bloqueada temporalmente por multiples intentos fallidos. Intenta de nuevo en 5 minutos."));
        }

        try {
            TokenResponse response = service.authenticate(request);
            loginAttemptService.loginSucceeded(clientIp);
            return ResponseEntity.ok()
                    .header("X-RateLimit-Remaining", String.valueOf(loginAttemptService.getRemainingAttempts(clientIp)))
                    .body(response);
        } catch (Exception e) {
            loginAttemptService.loginFailed(clientIp);
            int remaining = loginAttemptService.getRemainingAttempts(clientIp);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header("X-RateLimit-Remaining", String.valueOf(remaining))
                    .body(error("Error en login",
                            e.getMessage() + (remaining > 0
                                    ? ". Intentos restantes: " + remaining
                                    : ". IP bloqueada por 5 minutos.")));
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

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}
