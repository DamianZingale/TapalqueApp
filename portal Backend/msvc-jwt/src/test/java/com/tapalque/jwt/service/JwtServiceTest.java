package com.tapalque.jwt.service;

import com.tapalque.jwt.dto.UserResponseDTO;
import com.tapalque.jwt.enu.RolName;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtService Tests")
class JwtServiceTest {

    private JwtService jwtService;

    private UserResponseDTO testUser;

    // Base64 encoded secret key (al menos 256 bits para HS256)
    private static final String SECRET_KEY = "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2VzMTIzNDU2Nzg5MA==";
    private static final long JWT_EXPIRATION = 3600000; // 1 hora
    private static final long REFRESH_EXPIRATION = 86400000; // 24 horas

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Inyectar valores de configuración usando reflection
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", JWT_EXPIRATION);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", REFRESH_EXPIRATION);

        testUser = UserResponseDTO.builder()
                .email("test@example.com")
                .firtName("Test User")
                .password("encodedPassword")
                .rol(RolName.USER)
                .emailVerified(true)
                .build();
    }

    @Nested
    @DisplayName("Tests de Generación de Token")
    class GeneracionTokenTests {

        @Test
        @DisplayName("Debe generar token de acceso válido")
        void generateToken_ConUsuarioValido_RetornaToken() {
            // When
            String token = jwtService.generateToken(testUser);

            // Then
            assertNotNull(token);
            assertFalse(token.isEmpty());
            assertTrue(token.split("\\.").length == 3); // JWT tiene 3 partes
        }

        @Test
        @DisplayName("Debe generar refresh token válido")
        void generateRefreshToken_ConUsuarioValido_RetornaToken() {
            // When
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Then
            assertNotNull(refreshToken);
            assertFalse(refreshToken.isEmpty());
        }

        @Test
        @DisplayName("Token debe contener el email como subject")
        void generateToken_DebeContenerEmailComoSubject() {
            // When
            String token = jwtService.generateToken(testUser);
            String email = jwtService.extractEmail(token);

            // Then
            assertEquals("test@example.com", email);
        }

        @Test
        @DisplayName("Token debe contener claims personalizados")
        void generateToken_DebeContenerClaimsPersonalizados() {
            // When
            String token = jwtService.generateToken(testUser);
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertEquals("Test User", claims.get("fullName"));
            assertEquals("USER", claims.get("rol"));
        }
    }

    @Nested
    @DisplayName("Tests de Validación de Token")
    class ValidacionTokenTests {

        @Test
        @DisplayName("Debe validar token válido como true")
        void isTokenValid_ConTokenValido_RetornaTrue() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isValid = jwtService.isTokenValid(token);

            // Then
            assertTrue(isValid);
        }

        @Test
        @DisplayName("Debe validar token inválido como false")
        void isTokenValid_ConTokenInvalido_RetornaFalse() {
            // Given
            String invalidToken = "invalid.token.here";

            // When
            boolean isValid = jwtService.isTokenValid(invalidToken);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Debe validar token malformado como false")
        void isTokenValid_ConTokenMalformado_RetornaFalse() {
            // Given
            String malformedToken = "not-a-valid-jwt";

            // When
            boolean isValid = jwtService.isTokenValid(malformedToken);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Debe rechazar token con firma incorrecta")
        void isTokenValid_ConFirmaIncorrecta_RetornaFalse() {
            // Given - token generado con otra clave
            String tokenConOtraFirma = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

            // When
            boolean isValid = jwtService.isTokenValid(tokenConOtraFirma);

            // Then
            assertFalse(isValid);
        }
    }

    @Nested
    @DisplayName("Tests de Extracción de Email")
    class ExtraccionEmailTests {

        @Test
        @DisplayName("Debe extraer email correctamente")
        void extractEmail_ConTokenValido_RetornaEmail() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String email = jwtService.extractEmail(token);

            // Then
            assertEquals("test@example.com", email);
        }

        @Test
        @DisplayName("Debe lanzar excepción con token inválido")
        void extractEmail_ConTokenInvalido_LanzaExcepcion() {
            // Given
            String invalidToken = "invalid.token";

            // When & Then
            assertThrows(RuntimeException.class, () -> jwtService.extractEmail(invalidToken));
        }
    }

    @Nested
    @DisplayName("Tests de Claims")
    class ClaimsTests {

        @Test
        @DisplayName("Debe extraer todos los claims correctamente")
        void extractAllClaims_ConTokenValido_RetornaClaims() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertNotNull(claims);
            assertEquals("test@example.com", claims.getSubject());
            assertNotNull(claims.getIssuedAt());
            assertNotNull(claims.getExpiration());
        }

        @Test
        @DisplayName("Expiración debe ser mayor que fecha de emisión")
        void extractAllClaims_ExpiracionMayorQueEmision() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
        }
    }

    @Nested
    @DisplayName("Tests con diferentes roles")
    class RolesTests {

        @Test
        @DisplayName("Token de MODERADOR debe contener rol correcto")
        void generateToken_ParaModerador_ContieneRolCorrecto() {
            // Given
            UserResponseDTO moderador = UserResponseDTO.builder()
                    .email("mod@example.com")
                    .firtName("Moderador")
                    .rol(RolName.MODERADOR)
                    .emailVerified(true)
                    .build();

            // When
            String token = jwtService.generateToken(moderador);
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertEquals("MODERADOR", claims.get("rol"));
        }

        @Test
        @DisplayName("Token de ADMINISTRADOR debe contener rol correcto")
        void generateToken_ParaAdministrador_ContieneRolCorrecto() {
            // Given
            UserResponseDTO admin = UserResponseDTO.builder()
                    .email("admin@example.com")
                    .firtName("Admin")
                    .rol(RolName.ADMINISTRADOR)
                    .emailVerified(true)
                    .build();

            // When
            String token = jwtService.generateToken(admin);
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertEquals("ADMINISTRADOR", claims.get("rol"));
        }
    }
}
