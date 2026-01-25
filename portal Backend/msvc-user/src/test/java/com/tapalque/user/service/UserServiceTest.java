package com.tapalque.user.service;

import com.tapalque.user.dto.ChangePasswordDTO;
import com.tapalque.user.dto.UpdateProfileDTO;
import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.RoleRepository;
import com.tapalque.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private RoleRepository roleRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = new Role(3L, RolName.USER);
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .password("encodedPassword")
                .registrationDate(LocalDateTime.now())
                .role(userRole)
                .build();
        testUser.setEmailVerified(true);
    }

    @Nested
    @DisplayName("Tests de Registro")
    class RegistroTests {

        @Test
        @DisplayName("Debe registrar usuario exitosamente")
        void register_ConDatosValidos_RetornaUserResponseDTO() {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("nuevo@example.com", "Nuevo", "Password1!");
            when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(1L);
                return user;
            });
            when(emailVerificationService.generateVerificationToken(any(User.class))).thenReturn("token123");

            // When
            UserResponseDTO result = userService.register(dto, userRole);

            // Then
            assertNotNull(result);
            assertEquals("nuevo@example.com", result.getEmail());
            assertEquals("Nuevo", result.getNombre());
            assertFalse(result.isEmailVerified());
            verify(userRepo).save(any(User.class));
            verify(emailVerificationService).generateVerificationToken(any(User.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si el email ya existe")
        void register_ConEmailExistente_LanzaExcepcion() {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("test@example.com", "Test", "Password1!");
            when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> userService.register(dto, userRole)
            );
            assertEquals("El correo ya está registrado", exception.getMessage());
            verify(userRepo, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción con contraseña débil")
        void register_ConPasswordDebil_LanzaExcepcion() {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("nuevo@example.com", "Nuevo", "weak");

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> userService.register(dto, userRole));
            verify(userRepo, never()).save(any(User.class));
        }

        @Test
        @DisplayName("registerByModerator debe crear usuario con email verificado")
        void registerByModerator_CreaUsuarioVerificado() {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("admin@example.com", "Admin", "Password1!");
            when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(1L);
                return user;
            });

            // When
            UserResponseDTO result = userService.registerByModerator(dto, userRole);

            // Then
            assertNotNull(result);
            assertTrue(result.isEmailVerified());
            verify(emailVerificationService, never()).generateVerificationToken(any(User.class));
        }
    }

    @Nested
    @DisplayName("Tests de Consulta")
    class ConsultaTests {

        @Test
        @DisplayName("getByEmail debe retornar true si existe")
        void getByEmail_ConEmailExistente_RetornaTrue() {
            // Given
            when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            // When
            Boolean result = userService.getByEmail("test@example.com");

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("getByEmail debe retornar false si no existe")
        void getByEmail_ConEmailNoExistente_RetornaFalse() {
            // Given
            when(userRepo.findByEmail("noexiste@example.com")).thenReturn(Optional.empty());

            // When
            Boolean result = userService.getByEmail("noexiste@example.com");

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("getUserById debe retornar usuario si existe")
        void getUserById_ConIdExistente_RetornaUsuario() {
            // Given
            when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));

            // When
            Optional<UserResponseDTO> result = userService.getUserById(1L);

            // Then
            assertTrue(result.isPresent());
            assertEquals("test@example.com", result.get().getEmail());
        }

        @Test
        @DisplayName("getAllUsers debe retornar lista de usuarios")
        void getAllUsers_RetornaListaUsuarios() {
            // Given
            User user2 = User.builder()
                    .id(2L)
                    .email("otro@example.com")
                    .firstName("Otro")
                    .role(userRole)
                    .build();
            when(userRepo.findAll()).thenReturn(Arrays.asList(testUser, user2));

            // When
            List<UserResponseDTO> result = userService.getAllUsers();

            // Then
            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("getUsersByRole debe filtrar por rol")
        void getUsersByRole_FiltraPorRol() {
            // Given
            Role adminRole = new Role(2L, RolName.ADMINISTRADOR);
            User adminUser = User.builder()
                    .id(2L)
                    .email("admin@example.com")
                    .firstName("Admin")
                    .role(adminRole)
                    .build();
            when(userRepo.findAll()).thenReturn(Arrays.asList(testUser, adminUser));

            // When
            List<UserResponseDTO> result = userService.getUsersByRole(RolName.ADMINISTRADOR);

            // Then
            assertEquals(1, result.size());
            assertEquals("admin@example.com", result.get(0).getEmail());
        }
    }

    @Nested
    @DisplayName("Tests de Actualización de Perfil")
    class PerfilTests {

        @Test
        @DisplayName("updateProfile debe actualizar nombre y apellido")
        void updateProfile_ActualizaDatos() {
            // Given
            UpdateProfileDTO dto = new UpdateProfileDTO();
            dto.setNombre("NuevoNombre");
            dto.setApellido("NuevoApellido");
            dto.setDireccion("Nueva Dirección");

            when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepo.save(any(User.class))).thenReturn(testUser);

            // When
            UserResponseDTO result = userService.updateProfile(1L, dto);

            // Then
            assertNotNull(result);
            verify(userRepo).save(any(User.class));
        }

        @Test
        @DisplayName("updateProfile debe lanzar excepción si usuario no existe")
        void updateProfile_UsuarioNoExiste_LanzaExcepcion() {
            // Given
            UpdateProfileDTO dto = new UpdateProfileDTO();
            when(userRepo.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> userService.updateProfile(999L, dto));
        }
    }

    @Nested
    @DisplayName("Tests de Cambio de Contraseña")
    class PasswordTests {

        @Test
        @DisplayName("changePassword debe cambiar la contraseña correctamente")
        void changePassword_ConDatosValidos_CambiaPassword() {
            // Given
            ChangePasswordDTO dto = new ChangePasswordDTO();
            dto.setPasswordActual("Password1!");
            dto.setPasswordNueva("NewPassword1!");

            when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("Password1!", "encodedPassword")).thenReturn(true);
            when(passwordEncoder.encode("NewPassword1!")).thenReturn("newEncodedPassword");

            // When
            assertDoesNotThrow(() -> userService.changePassword(1L, dto));

            // Then
            verify(userRepo).save(any(User.class));
        }

        @Test
        @DisplayName("changePassword debe fallar con contraseña actual incorrecta")
        void changePassword_ConPasswordIncorrecta_LanzaExcepcion() {
            // Given
            ChangePasswordDTO dto = new ChangePasswordDTO();
            dto.setPasswordActual("WrongPassword1!");
            dto.setPasswordNueva("NewPassword1!");

            when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("WrongPassword1!", "encodedPassword")).thenReturn(false);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> userService.changePassword(1L, dto)
            );
            assertEquals("La contraseña actual es incorrecta", exception.getMessage());
            verify(userRepo, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Tests de Cambio de Rol")
    class RolTests {

        @Test
        @DisplayName("changeUserRole debe cambiar el rol correctamente")
        void changeUserRole_CambiaRolCorrectamente() {
            // Given
            Role adminRole = new Role(2L, RolName.ADMINISTRADOR);
            when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
            when(roleRepo.findByName(RolName.ADMINISTRADOR)).thenReturn(Optional.of(adminRole));
            when(userRepo.save(any(User.class))).thenReturn(testUser);

            // When
            UserResponseDTO result = userService.changeUserRole(1L, RolName.ADMINISTRADOR);

            // Then
            assertNotNull(result);
            verify(userRepo).save(any(User.class));
        }

        @Test
        @DisplayName("changeUserRole debe fallar si usuario no existe")
        void changeUserRole_UsuarioNoExiste_LanzaExcepcion() {
            // Given
            when(userRepo.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(IllegalArgumentException.class,
                    () -> userService.changeUserRole(999L, RolName.ADMINISTRADOR));
        }
    }
}
