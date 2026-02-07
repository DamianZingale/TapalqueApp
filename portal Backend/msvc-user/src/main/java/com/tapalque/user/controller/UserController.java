package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.ChangePasswordDTO;
import com.tapalque.user.dto.UpdateProfileDTO;
import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.entity.Role;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.service.EmailService;
import com.tapalque.user.service.EmailVerificationService;
import com.tapalque.user.service.PasswordResetService;
import com.tapalque.user.service.UserService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;

    public UserController(
            UserService userService,
            EmailVerificationService emailVerificationService,
            EmailService emailService,
            PasswordResetService passwordResetService) {
        this.userService = userService;
        this.emailVerificationService = emailVerificationService;
        this.emailService = emailService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/public/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            Role role = new Role(3L, RolName.USER);
            UserResponseDTO response = userService.register(dto, role);  
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
            UserResponseDTO response = userService.register(dto, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
           return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @PostMapping("/GastroRegistro")
    public ResponseEntity<?> registerGastro(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            Role role = new Role(2L, RolName.ADMINISTRADOR);
            UserResponseDTO response = userService.register(dto, role);
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
                        response.put("id", user.getId());
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

    // ==================== PASSWORD RESET ENDPOINTS ====================

    // Solicitar restablecimiento de contraseña
    @PostMapping("/public/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El email es obligatorio"));
            }

            String token = passwordResetService.generatePasswordResetToken(email);

            if (token != null) {
                // Obtener usuario para enviar email
                userService.getUserByEmailWithPassword(email).ifPresent(user -> {
                    try {
                        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
                    } catch (Exception e) {
                        System.err.println("Error al enviar email de reset: " + e.getMessage());
                        System.out.println("Token de reset para " + email + ": " + token);
                    }
                });
            }

            // Siempre respondemos éxito para no revelar si el email existe o no
            Map<String, String> response = new HashMap<>();
            response.put("message", "Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error", "Error al procesar la solicitud"));
        }
    }

    // Validar token de reset (para verificar antes de mostrar el formulario)
    @GetMapping("/public/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.isValidResetToken(token);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);

            if (!isValid) {
                response.put("message", "El enlace ha expirado o es inválido");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error", "Error al validar el token"));
        }
    }

    // Restablecer contraseña con token
    @PostMapping("/public/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            String token = payload.get("token");
            String newPassword = payload.get("password");

            if (token == null || token.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "Token inválido"));
            }

            if (newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "La contraseña es obligatoria"));
            }

            boolean success = passwordResetService.resetPassword(token, newPassword);

            if (success) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El enlace ha expirado o es inválido. Solicita uno nuevo."));
            }
        } catch (IllegalArgumentException e) {
            // Error de validación de contraseña
            return ResponseEntity.badRequest()
                    .body(error("Error de validación", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error", "Error al restablecer la contraseña"));
        }
    }

    // ==================== MODERADOR ENDPOINTS ====================

    @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        try {
            List<UserResponseDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        try {
            return userService.getUserById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/administradores")
    public ResponseEntity<List<UserResponseDTO>> getAdministrators() {
        try {
            List<UserResponseDTO> admins = userService.getUsersByRole(RolName.ADMINISTRADOR);
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String newRoleName = payload.get("role");
            if (newRoleName == null || newRoleName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El rol es obligatorio"));
            }

            RolName newRole = RolName.valueOf(newRoleName.toUpperCase());
            UserResponseDTO updated = userService.changeUserRole(id, newRole);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", "Rol inválido. Use: USER, ADMINISTRADOR o MODERADOR"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al cambiar rol", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> changeUserStatus(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            Boolean activo = payload.get("activo");
            if (activo == null) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El estado activo es obligatorio"));
            }

            UserResponseDTO updated = userService.changeUserStatus(id, activo);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al cambiar estado", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('MODERADOR')")
    @PostMapping("/moderador/create")
    public ResponseEntity<?> createUserWithRole(@Valid @RequestBody UserRegistrationDTO dto) {
        try {
            String roleName = dto.getRole() != null ? dto.getRole().toUpperCase() : "USER";
            RolName rolName = RolName.valueOf(roleName);

            Long roleId = switch (rolName) {
                case MODERADOR -> 1L;
                case ADMINISTRADOR -> 2L;
                default -> 3L;
            };

            Role role = new Role(roleId, rolName);
            UserResponseDTO response = userService.registerByModerator(dto, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", "Rol inválido. Use: USER, ADMINISTRADOR o MODERADOR"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error("Error en registro", e.getMessage()));
        }
    }

    // ==================== PROFILE ENDPOINTS ====================

    // Obtener perfil del usuario autenticado
    @GetMapping("/profile/me")
    public ResponseEntity<?> getMyProfile(@RequestParam String email) {
        try {
            return userService.getUserByEmail(email)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al obtener perfil", e.getMessage()));
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable @NonNull  Long id,
            @RequestBody UpdateProfileDTO dto) {
        try {
            UserResponseDTO updated = userService.updateProfile(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al actualizar perfil", e.getMessage()));
        }
    }

  

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordDTO dto) {
        try {
            userService.changePassword(id, dto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al cambiar contraseña", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }

    @GetMapping("/role/{id}")
    public String getRol (@PathVariable @NonNull String param) {
        try {
             Long id = Long.valueOf(param);
             String role = userService.getRoleByUserId(id);
             return role;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID de usuario inválido");
        }     
    }
}
    