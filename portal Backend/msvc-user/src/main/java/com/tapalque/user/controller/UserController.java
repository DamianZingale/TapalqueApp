package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;  // ← NUEVO
import com.tapalque.user.entity.Role;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.service.EmailService;
import com.tapalque.user.service.EmailVerificationService;
import com.tapalque.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")  // ← CORREGIDO: sin /api
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

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

    // @PreAuthorize("hasRole('MODERADOR')")
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

    // @PreAuthorize("hasRole('ADMINISTRADOR')")
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

    // Endpoint interno para autenticación (incluye password)
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            return userService.getUserByEmailWithPassword(email)
                    .map(user -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("email", user.getEmail());
                        response.put("firtName", user.getFirstName());
                        response.put("password", user.getPassword());
                        response.put("rol", user.getRole().getName());
                        response.put("emailVerified", user.isEmailVerified());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al obtener usuario", e.getMessage()));
        }
    }

    // Verificar email con token
    @GetMapping("/public/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = emailVerificationService.verifyEmail(token);
            if (verified) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email verificado correctamente");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(error("Error de verificación", "Token inválido o expirado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al verificar email", e.getMessage()));
        }
    }

    // Reenviar email de verificación
    @PostMapping("/public/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String token = emailVerificationService.resendVerificationToken(email);

            if (token != null) {
                // Obtener usuario para enviar email
                userService.getUserByEmailWithPassword(email).ifPresent(user -> {
                    try {
                        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);
                    } catch (Exception e) {
                        System.err.println("Error al enviar email de verificación: " + e.getMessage());
                        System.out.println("Token de verificación reenviado para " + email + ": " + token);
                    }
                });

                Map<String, String> response = new HashMap<>();
                response.put("message", "Email de verificación reenviado");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El email no existe o ya está verificado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al reenviar verificación", e.getMessage()));
        }
    }

    // ==================== MODERADOR ENDPOINTS ====================

    /**
     * Listar todos los usuarios del sistema
     * Solo accesible por MODERADOR
     */
    // @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        try {
            List<UserResponseDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener un usuario por ID
     * Solo accesible por MODERADOR
     */
    // @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            return userService.getUserById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al obtener usuario", e.getMessage()));
        }
    }

    /**
     * Listar solo usuarios con rol ADMINISTRADOR
     * Para asignar administradores a negocios
     * Solo accesible por MODERADOR
     */
    // @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/administradores")
    public ResponseEntity<List<UserResponseDTO>> getAdministrators() {
        try {
            List<UserResponseDTO> admins = userService.getUsersByRole(RolName.ADMINISTRADOR);
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cambiar el rol de un usuario
     * Permite cambiar entre USER y ADMINISTRADOR
     * NO permite crear MODERADORES
     * Solo accesible por MODERADOR
     */
    // @PreAuthorize("hasRole('MODERADOR')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String newRoleName = payload.get("role");
            if (newRoleName == null || newRoleName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El rol es obligatorio"));
            }

            // Validar que no se intente crear otro MODERADOR
            if ("MODERADOR".equalsIgnoreCase(newRoleName)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(error("Error", "No se puede asignar el rol MODERADOR"));
            }

            RolName newRole = RolName.valueOf(newRoleName.toUpperCase());
            UserResponseDTO updated = userService.changeUserRole(id, newRole);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", "Rol inválido. Use: USER o ADMINISTRADOR"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al cambiar rol", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}