package com.tapalque.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
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

@Service

public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    public UserService(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder passwordEncoder,
            EmailVerificationService emailVerificationService, EmailService emailService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService = emailVerificationService;
        this.emailService = emailService;
    }


    public UserResponseDTO register(UserRegistrationDTO dto, Role role) {  
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

 
    // Registrar usuario desde el panel del moderador con email verificado automáticamente
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

        user.setEmailVerified(true); // Verificado por moderador
        userRepo.save(user);

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


    public List<UserResponseDTO> getAllUsers() {
        return userRepo.findAll()
                .stream()
                .map(UserResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }


    public java.util.Optional<UserResponseDTO> getUserById(@NonNull Long id) {
        return userRepo.findById(id)
                .map(UserResponseDTO::fromEntity);
    }


    public List<UserResponseDTO> getUsersByRole(RolName rolName) {
        return userRepo.findAll()
                .stream()
                .filter(user -> user.getRole().getName() == rolName)
                .map(UserResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }


    public UserResponseDTO changeUserRole(@NonNull  Long userId, RolName newRolName) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Buscar el rol en la base de datos
        Role newRole = roleRepo.findByName(newRolName)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        user.setRole(newRole);
        userRepo.save(user);

        return UserResponseDTO.fromEntity(user);
    }

    public UserResponseDTO changeUserStatus(@NonNull Long userId, @NonNull Boolean activo) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setActivo(activo);
        userRepo.save(user);

        return UserResponseDTO.fromEntity(user);
    }

    public UserResponseDTO updateProfile(@NonNull  Long userId, UpdateProfileDTO dto) {
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
    public void changePassword(@NonNull  Long userId, ChangePasswordDTO dto) {
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

    
    public String getRoleByUserId(@NonNull  Long userId) {
        try{
            if (!userRepo.existsById(userId)){
                throw new IllegalArgumentException("El usuario con el ID proporcionado no existe");
            }else{
                        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return user.getRole().getName().name();
            }
        }
        catch (IllegalArgumentException e){
            throw new IllegalArgumentException("Error al procesar el ID de usuario");
        }
        
    }   
}