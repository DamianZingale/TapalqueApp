package com.tapalque.jwt.service;

import com.tapalque.jwt.dto.AuthRequestDTO;
import com.tapalque.jwt.dto.TokenResponse;
import com.tapalque.jwt.dto.UserResponseDTO;
import com.tapalque.jwt.entity.Token;
import com.tapalque.jwt.enu.RolName;
import com.tapalque.jwt.repository.TokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private TokenRepository tokenRepositorio;

    @Mock
    private JwtService jwtServicio;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private AuthService authService;

    private UserResponseDTO testUser;
    private AuthRequestDTO authRequest;

    @BeforeEach
    void setUp() {
        testUser = UserResponseDTO.builder()
                .email("test@example.com")
                .firtName("Test User")
                .password("encodedPassword")
                .rol(RolName.USER)
                .emailVerified(true)
                .build();

        authRequest = new AuthRequestDTO();
        authRequest.setEmail("test@example.com");
        authRequest.setPassword("Password1!");
    }

    @Nested
    @DisplayName("Tests de Autenticación")
    class AutenticacionTests {

        @Test
        @DisplayName("Debe autenticar usuario con credenciales válidas")
        void authenticate_ConCredencialesValidas_RetornaTokenResponse() {
            // Given
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "Password1!"));
            when(userClient.getUser("test@example.com")).thenReturn(testUser);
            when(jwtServicio.generateToken(testUser)).thenReturn("accessToken123");
            when(jwtServicio.generateRefreshToken(testUser)).thenReturn("refreshToken123");
            when(tokenRepositorio.findByEmailAndExpiredFalseAndRevokedFalse(anyString()))
                    .thenReturn(Collections.emptyList());

            // When
            TokenResponse response = authService.authenticate(authRequest);

            // Then
            assertNotNull(response);
            assertEquals("accessToken123", response.getAccessToken());
            assertEquals("refreshToken123", response.getRefreshToken());
            verify(tokenRepositorio).save(any(Token.class));
        }

        @Test
        @DisplayName("Debe fallar con credenciales inválidas")
        void authenticate_ConCredencialesInvalidas_LanzaExcepcion() {
            // Given
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            // When & Then
            assertThrows(BadCredentialsException.class, () -> authService.authenticate(authRequest));
            verify(tokenRepositorio, never()).save(any(Token.class));
        }

        @Test
        @DisplayName("Debe fallar si email no está verificado")
        void authenticate_ConEmailNoVerificado_LanzaExcepcion() {
            // Given
            UserResponseDTO userNoVerificado = UserResponseDTO.builder()
                    .email("test@example.com")
                    .firtName("Test")
                    .rol(RolName.USER)
                    .emailVerified(false)
                    .build();

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "Password1!"));
            when(userClient.getUser("test@example.com")).thenReturn(userNoVerificado);

            // When & Then
            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> authService.authenticate(authRequest)
            );
            assertTrue(exception.getMessage().contains("verificar tu email"));
            verify(tokenRepositorio, never()).save(any(Token.class));
        }

        @Test
        @DisplayName("Debe revocar tokens anteriores al autenticar")
        void authenticate_DebeRevocarTokensAnteriores() {
            // Given
            Token oldToken = Token.builder()
                    .id(1L)
                    .email("test@example.com")
                    .token("oldToken")
                    .expired(false)
                    .revoked(false)
                    .build();
            List<Token> oldTokens = new ArrayList<>();
            oldTokens.add(oldToken);

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "Password1!"));
            when(userClient.getUser("test@example.com")).thenReturn(testUser);
            when(jwtServicio.generateToken(testUser)).thenReturn("newAccessToken");
            when(jwtServicio.generateRefreshToken(testUser)).thenReturn("newRefreshToken");
            when(tokenRepositorio.findByEmailAndExpiredFalseAndRevokedFalse("test@example.com"))
                    .thenReturn(oldTokens);

            // When
            authService.authenticate(authRequest);

            // Then
            assertTrue(oldToken.getExpired());
            assertTrue(oldToken.getRevoked());
            verify(tokenRepositorio).saveAll(oldTokens);
        }
    }

    @Nested
    @DisplayName("Tests de Refresh Token")
    class RefreshTokenTests {

        @Test
        @DisplayName("Debe refrescar token con header válido")
        void refreshToken_ConHeaderValido_RetornaNuevoToken() {
            // Given
            String authHeader = "Bearer validRefreshToken";
            when(jwtServicio.extractEmail("validRefreshToken")).thenReturn("test@example.com");
            when(userClient.getUser("test@example.com")).thenReturn(testUser);
            when(jwtServicio.isTokenValid("validRefreshToken")).thenReturn(true);
            when(jwtServicio.generateToken(testUser)).thenReturn("newAccessToken");
            when(tokenRepositorio.findByEmailAndExpiredFalseAndRevokedFalse(anyString()))
                    .thenReturn(Collections.emptyList());

            // When
            TokenResponse response = authService.refreshToken(authHeader);

            // Then
            assertNotNull(response);
            assertEquals("newAccessToken", response.getAccessToken());
            assertEquals("validRefreshToken", response.getRefreshToken());
        }

        @Test
        @DisplayName("Debe fallar con header nulo")
        void refreshToken_ConHeaderNulo_LanzaExcepcion() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () -> authService.refreshToken(null));
        }

        @Test
        @DisplayName("Debe fallar con header sin Bearer")
        void refreshToken_SinBearer_LanzaExcepcion() {
            // Given
            String authHeader = "InvalidHeader token123";

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> authService.refreshToken(authHeader));
        }

        @Test
        @DisplayName("Debe retornar null si token es inválido")
        void refreshToken_ConTokenInvalido_RetornaNull() {
            // Given
            String authHeader = "Bearer invalidToken";
            when(jwtServicio.extractEmail("invalidToken")).thenReturn("test@example.com");
            when(userClient.getUser("test@example.com")).thenReturn(testUser);
            when(jwtServicio.isTokenValid("invalidToken")).thenReturn(false);

            // When
            TokenResponse response = authService.refreshToken(authHeader);

            // Then
            assertNull(response);
        }

        @Test
        @DisplayName("Debe retornar null si email es null")
        void refreshToken_ConEmailNull_RetornaNull() {
            // Given
            String authHeader = "Bearer someToken";
            when(jwtServicio.extractEmail("someToken")).thenReturn(null);

            // When
            TokenResponse response = authService.refreshToken(authHeader);

            // Then
            assertNull(response);
        }
    }

    @Nested
    @DisplayName("Tests de diferentes roles")
    class RolesTests {

        @Test
        @DisplayName("Debe autenticar MODERADOR correctamente")
        void authenticate_Moderador_RetornaTokenConRol() {
            // Given
            UserResponseDTO moderador = UserResponseDTO.builder()
                    .email("mod@example.com")
                    .firtName("Moderador")
                    .rol(RolName.MODERADOR)
                    .emailVerified(true)
                    .build();

            AuthRequestDTO modRequest = new AuthRequestDTO();
            modRequest.setEmail("mod@example.com");
            modRequest.setPassword("Password1!");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("mod@example.com", "Password1!"));
            when(userClient.getUser("mod@example.com")).thenReturn(moderador);
            when(jwtServicio.generateToken(moderador)).thenReturn("modAccessToken");
            when(jwtServicio.generateRefreshToken(moderador)).thenReturn("modRefreshToken");
            when(tokenRepositorio.findByEmailAndExpiredFalseAndRevokedFalse(anyString()))
                    .thenReturn(Collections.emptyList());

            // When
            TokenResponse response = authService.authenticate(modRequest);

            // Then
            assertNotNull(response);
            assertEquals(moderador, response.getUser());
        }

        @Test
        @DisplayName("Debe autenticar ADMINISTRADOR correctamente")
        void authenticate_Administrador_RetornaTokenConRol() {
            // Given
            UserResponseDTO admin = UserResponseDTO.builder()
                    .email("admin@example.com")
                    .firtName("Admin")
                    .rol(RolName.ADMINISTRADOR)
                    .emailVerified(true)
                    .build();

            AuthRequestDTO adminRequest = new AuthRequestDTO();
            adminRequest.setEmail("admin@example.com");
            adminRequest.setPassword("Password1!");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("admin@example.com", "Password1!"));
            when(userClient.getUser("admin@example.com")).thenReturn(admin);
            when(jwtServicio.generateToken(admin)).thenReturn("adminAccessToken");
            when(jwtServicio.generateRefreshToken(admin)).thenReturn("adminRefreshToken");
            when(tokenRepositorio.findByEmailAndExpiredFalseAndRevokedFalse(anyString()))
                    .thenReturn(Collections.emptyList());

            // When
            TokenResponse response = authService.authenticate(adminRequest);

            // Then
            assertNotNull(response);
            assertEquals(admin, response.getUser());
        }
    }
}
