package com.tapalque.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.user.dto.ChangePasswordDTO;
import com.tapalque.user.dto.UpdateProfileDTO;
import com.tapalque.user.dto.UserRegistrationDTO;
import com.tapalque.user.dto.UserResponseDTO;
import com.tapalque.user.service.EmailService;
import com.tapalque.user.service.EmailVerificationService;
import com.tapalque.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailVerificationService emailVerificationService;

    @MockBean
    private EmailService emailService;

    private UserResponseDTO testUserResponse;

    @BeforeEach
    void setUp() {
        testUserResponse = new UserResponseDTO(
                1L, "test@example.com", "Test", "User", "Calle 123", "USER", true
        );
    }

    @Nested
    @DisplayName("Tests de Registro")
    class RegistroTests {

        @Test
        @DisplayName("POST /user/public/register - Registro exitoso")
        void register_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("nuevo@example.com", "Nuevo", "Password1!");
            when(userService.register(any(UserRegistrationDTO.class), any())).thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(post("/user/public/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        @DisplayName("POST /user/public/register - Registro con email inválido")
        void register_ConEmailInvalido_RetornaBadRequest() throws Exception {
            // Given
            String invalidJson = "{\"correo\":\"invalid\",\"nombre\":\"Test\",\"contrasenia\":\"Password1!\"}";

            // When & Then
            mockMvc.perform(post("/user/public/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /user/public/register - Error de servicio")
        void register_ConErrorServicio_RetornaBadRequest() throws Exception {
            // Given
            UserRegistrationDTO dto = new UserRegistrationDTO("test@example.com", "Test", "Password1!");
            when(userService.register(any(UserRegistrationDTO.class), any()))
                    .thenThrow(new IllegalArgumentException("El correo ya está registrado"));

            // When & Then
            mockMvc.perform(post("/user/public/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").exists());
        }
    }

    @Nested
    @DisplayName("Tests de Consulta")
    class ConsultaTests {

        @Test
        @DisplayName("GET /user/all - Obtener todos los usuarios")
        void getAllUsers_RetornaListaUsuarios() throws Exception {
            // Given
            when(userService.getAllUsers()).thenReturn(Arrays.asList(testUserResponse));

            // When & Then
            mockMvc.perform(get("/user/all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].email").value("test@example.com"));
        }

        @Test
        @DisplayName("GET /user/{id} - Obtener usuario por ID")
        void getUserById_ConIdExistente_RetornaUsuario() throws Exception {
            // Given
            when(userService.getUserById(1L)).thenReturn(Optional.of(testUserResponse));

            // When & Then
            mockMvc.perform(get("/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        @DisplayName("GET /user/{id} - Usuario no encontrado")
        void getUserById_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(userService.getUserById(999L)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/user/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /user/administradores - Obtener administradores")
        void getAdministrators_RetornaListaAdmins() throws Exception {
            // Given
            UserResponseDTO adminResponse = new UserResponseDTO(
                    2L, "admin@example.com", "Admin", "User", null, "ADMINISTRADOR", true
            );
            when(userService.getUsersByRole(any())).thenReturn(Arrays.asList(adminResponse));

            // When & Then
            mockMvc.perform(get("/user/administradores"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].rol").value("ADMINISTRADOR"));
        }
    }

    @Nested
    @DisplayName("Tests de Verificación de Email")
    class VerificacionTests {

        @Test
        @DisplayName("GET /user/public/verify-email - Verificación exitosa")
        void verifyEmail_ConTokenValido_RetornaOk() throws Exception {
            // Given
            when(emailVerificationService.verifyEmail("validToken")).thenReturn(true);

            // When & Then
            mockMvc.perform(get("/user/public/verify-email")
                            .param("token", "validToken"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Email verificado correctamente"));
        }

        @Test
        @DisplayName("GET /user/public/verify-email - Token inválido")
        void verifyEmail_ConTokenInvalido_RetornaBadRequest() throws Exception {
            // Given
            when(emailVerificationService.verifyEmail("invalidToken")).thenReturn(false);

            // When & Then
            mockMvc.perform(get("/user/public/verify-email")
                            .param("token", "invalidToken"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").exists());
        }
    }

    @Nested
    @DisplayName("Tests de Perfil")
    class PerfilTests {

        @Test
        @DisplayName("PUT /user/{id}/profile - Actualizar perfil")
        void updateProfile_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            UpdateProfileDTO dto = new UpdateProfileDTO();
            dto.setNombre("NuevoNombre");
            dto.setApellido("NuevoApellido");

            when(userService.updateProfile(eq(1L), any(UpdateProfileDTO.class))).thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(put("/user/1/profile")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PUT /user/{id}/password - Cambiar contraseña")
        void changePassword_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            ChangePasswordDTO dto = new ChangePasswordDTO();
            dto.setPasswordActual("OldPassword1!");
            dto.setPasswordNueva("NewPassword1!");

            doNothing().when(userService).changePassword(eq(1L), any(ChangePasswordDTO.class));

            // When & Then
            mockMvc.perform(put("/user/1/password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Contraseña actualizada correctamente"));
        }

        @Test
        @DisplayName("PUT /user/{id}/password - Contraseña incorrecta")
        void changePassword_ConPasswordIncorrecta_RetornaBadRequest() throws Exception {
            // Given
            ChangePasswordDTO dto = new ChangePasswordDTO();
            dto.setPasswordActual("WrongPassword1!");
            dto.setPasswordNueva("NewPassword1!");

            doThrow(new IllegalArgumentException("La contraseña actual es incorrecta"))
                    .when(userService).changePassword(eq(1L), any(ChangePasswordDTO.class));

            // When & Then
            mockMvc.perform(put("/user/1/password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").exists());
        }
    }

    @Nested
    @DisplayName("Tests de Cambio de Rol")
    class RolTests {

        @Test
        @DisplayName("PATCH /user/{id}/role - Cambiar rol exitosamente")
        void changeUserRole_ConRolValido_RetornaOk() throws Exception {
            // Given
            when(userService.changeUserRole(eq(1L), any())).thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(patch("/user/1/role")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"ADMINISTRADOR\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PATCH /user/{id}/role - Rol inválido")
        void changeUserRole_ConRolInvalido_RetornaBadRequest() throws Exception {
            // When & Then
            mockMvc.perform(patch("/user/1/role")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"role\":\"INVALID_ROLE\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Tests de Creación por Moderador")
    class ModeradorTests {

        @Test
        @DisplayName("POST /user/moderador/create - Crear usuario con rol")
        void createUserWithRole_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            String requestJson = "{\"correo\":\"nuevo@example.com\",\"nombre\":\"Nuevo\",\"contrasenia\":\"Password1!\",\"role\":\"USER\"}";
            when(userService.registerByModerator(any(UserRegistrationDTO.class), any())).thenReturn(testUserResponse);

            // When & Then
            mockMvc.perform(post("/user/moderador/create")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isCreated());
        }
    }
}
