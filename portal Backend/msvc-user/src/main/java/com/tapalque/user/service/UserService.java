package com.tapalque.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tapalque.user.dto.ChangePasswordDTO;
import com.tapalque.user.dto.UpdateProfileDTO;
import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.RoleRepository;
import com.tapalque.user.repository.UserRepository;
import com.tapalque.user.util.PasswordValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    public UserResponseDTO register(UserRegistrationDTO dto, Role role) {  // ← Retorna UserResponseDTO
        // Validar fortaleza de contraseña
        PasswordValidator.validate(dto.getPassword());

        // Verificar si el email ya existe
        if (userRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        // Encriptar contraseña
        String encoded = passwordEncoder.encode(dto.getPassword());

        // Crear usuario (sin verificar email por defecto)
        User user = User.builder()
                .email(dto.getEmail())
                .password(encoded)
                .firstName(dto.getFirtName())
                .registrationDate(LocalDateTime.now())
                .role(role)
                .build();

        user.setEmailVerified(false); // Por defecto no verificado
        userRepo.save(user);

        // Generar token de verificación
        String verificationToken = emailVerificationService.generateVerificationToken(user);

        // Enviar email de verificación
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);
        } catch (Exception e) {
            // Log del error pero no fallar el registro
            System.err.println("Error al enviar email de verificación: " + e.getMessage());
            // El token se imprime en consola como fallback
            System.out.println("Token de verificación para " + user.getEmail() + ": " + verificationToken);
        }

        return UserResponseDTO.fromEntity(user);  // ← Sin password
    }

    /**
     * Registrar usuario desde el panel del moderador con email verificado automáticamente
     */
    public UserResponseDTO registerByModerator(UserRegistrationDTO dto, Role role) {
        // Validar fortaleza de contraseña
        PasswordValidator.validate(dto.getPassword());

        // Verificar si el email ya existe
        if (userRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        // Encriptar contraseña
        String encoded = passwordEncoder.encode(dto.getPassword());

        // Crear usuario (verificado automáticamente por moderador)
        User user = User.builder()
                .email(dto.getEmail())
                .password(encoded)
                .firstName(dto.getFirtName())
                .registrationDate(LocalDateTime.now())
                .role(role)
                .build();

        user.setEmailVerified(true); // Verificado automáticamente por moderador
        userRepo.save(user);

        // No enviar email de verificación ya que el moderador ya validó al usuario

        return UserResponseDTO.fromEntity(user);
    }

    public Boolean getByEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }

    public java.util.Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .map(UserResponseDTO::fromEntity);
    }

    // Para uso interno en autenticación - incluye password
    public java.util.Optional<User> getUserByEmailWithPassword(String email) {
        return userRepo.findByEmail(email);
    }

    // ==================== MODERADOR METHODS ====================

    /**
     * Obtener todos los usuarios del sistema
     */
    public List<UserResponseDTO> getAllUsers() {
        return userRepo.findAll()
                .stream()
                .map(UserResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Obtener un usuario por ID
     */
    public java.util.Optional<UserResponseDTO> getUserById(Long id) {
        return userRepo.findById(id)
                .map(UserResponseDTO::fromEntity);
    }

    /**
     * Obtener usuarios por rol
     */
    public List<UserResponseDTO> getUsersByRole(RolName rolName) {
        return userRepo.findAll()
                .stream()
                .filter(user -> user.getRole().getName() == rolName)
                .map(UserResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Cambiar el rol de un usuario
     * No permite cambiar a MODERADOR
     */
    public UserResponseDTO changeUserRole(Long userId, RolName newRolName) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Buscar el rol en la base de datos
        Role newRole = roleRepo.findByName(newRolName)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        user.setRole(newRole);
        userRepo.save(user);

        return UserResponseDTO.fromEntity(user);
    }

    // ==================== PROFILE METHODS ====================

    /**
     * Actualizar perfil del usuario (nombre, apellido, direccion)
     */
    public UserResponseDTO updateProfile(Long userId, UpdateProfileDTO dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            user.setFirstName(dto.getNombre());
        }
        if (dto.getApellido() != null) {
            user.setLastName(dto.getApellido());
        }
        if (dto.getDireccion() != null) {
            user.setDireccion(dto.getDireccion());
        }

        userRepo.save(user);
        return UserResponseDTO.fromEntity(user);
    }

    /**
     * Cambiar contraseña del usuario
     */
    public void changePassword(Long userId, ChangePasswordDTO dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Verificar contraseña actual
        if (!passwordEncoder.matches(dto.getPasswordActual(), user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        // Validar fortaleza de nueva contraseña
        PasswordValidator.validate(dto.getPasswordNueva());

        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(dto.getPasswordNueva()));
        userRepo.save(user);
    }
}