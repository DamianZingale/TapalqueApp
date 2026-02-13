package com.tapalque.mercado_pago.service;

import com.tapalque.mercado_pago.dto.OauthTokenRequestDTO;
import com.tapalque.mercado_pago.dto.TipoServicioEnum;
import com.tapalque.mercado_pago.entity.OauthToken;
import com.tapalque.mercado_pago.repository.OauthTokenRepository;
import com.tapalque.mercado_pago.util.EncriptadoUtil;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OauthService Tests")
class OauthServiceTest {

    @Mock
    private OauthTokenRepository oauthRepository;

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private StateOauthService stateOauthService;

    @Mock
    private EncriptadoUtil encriptadoUtil;

    @InjectMocks
    private OauthService oauthService;

    private OauthToken testOauthToken;
    private OauthTokenRequestDTO testTokenDTO;

    @BeforeEach
    void setUp() {
        testOauthToken = new OauthToken();
        testOauthToken.setId(1L);
        testOauthToken.setUsuarioId(1L);
        testOauthToken.setAccessToken("encryptedAccessToken");
        testOauthToken.setRefreshToken("encryptedRefreshToken");
        testOauthToken.setPublicKey("encryptedPublicKey");
        testOauthToken.setUserId(123456L);
        testOauthToken.setLiveMode(false);
        testOauthToken.setExpiresAt(LocalDateTime.now().plusHours(6));
        testOauthToken.setExternalBusinessId(10L);
        testOauthToken.setTipoServicio(TipoServicioEnum.GASTRONOMICO);

        testTokenDTO = new OauthTokenRequestDTO();
        testTokenDTO.setAccessToken("newAccessToken");
        testTokenDTO.setRefreshToken("newRefreshToken");
        testTokenDTO.setPublicKey("newPublicKey");
        testTokenDTO.setUserId(123456L);
        testTokenDTO.setLiveMode(false);
        testTokenDTO.setExpiresIn(21600L);
    }

    @Nested
    @DisplayName("Tests de obtenerAccessTokenPorNegocio")
    class ObtenerAccessTokenTests {

        @Test
        @DisplayName("Debe retornar access token cuando el negocio existe")
        void obtenerAccessTokenPorNegocio_ConNegocioExistente_RetornaToken() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO))
                    .thenReturn(Optional.of(testOauthToken));

            // When
            String result = oauthService.obtenerAccessTokenPorNegocio(10L, TipoServicioEnum.GASTRONOMICO);

            // Then
            assertNotNull(result);
            assertEquals("encryptedAccessToken", result);
            verify(oauthRepository).findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO);
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando el negocio no existe")
        void obtenerAccessTokenPorNegocio_ConNegocioNoExistente_LanzaExcepcion() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(999L, TipoServicioEnum.HOSPEDAJE))
                    .thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> oauthService.obtenerAccessTokenPorNegocio(999L, TipoServicioEnum.HOSPEDAJE)
            );
            assertEquals("No se encontro access token para el negocio", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Tests de guardarTokenNuevo")
    class GuardarTokenNuevoTests {

        @Test
        @DisplayName("Debe guardar token nuevo correctamente para un negocio")
        void guardarTokenNuevo_ConDatosValidos_GuardaToken() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO))
                    .thenReturn(Optional.empty());
            when(encriptadoUtil.encriptar("newAccessToken")).thenReturn("encryptedNewAccessToken");
            when(encriptadoUtil.encriptar("newRefreshToken")).thenReturn("encryptedNewRefreshToken");
            when(encriptadoUtil.encriptar("newPublicKey")).thenReturn("encryptedNewPublicKey");
            when(oauthRepository.save(any(OauthToken.class))).thenReturn(testOauthToken);

            // When
            oauthService.guardarTokenNuevo(testTokenDTO, 1L, 10L, TipoServicioEnum.GASTRONOMICO);

            // Then
            verify(encriptadoUtil).encriptar("newAccessToken");
            verify(encriptadoUtil).encriptar("newRefreshToken");
            verify(encriptadoUtil).encriptar("newPublicKey");
            verify(oauthRepository).save(any(OauthToken.class));
        }

        @Test
        @DisplayName("Debe actualizar token existente si el negocio ya tiene uno (re-autorización)")
        void guardarTokenNuevo_ConNegocioExistente_ActualizaToken() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO))
                    .thenReturn(Optional.of(testOauthToken));
            when(encriptadoUtil.encriptar("newAccessToken")).thenReturn("encryptedNewAccessToken");
            when(encriptadoUtil.encriptar("newRefreshToken")).thenReturn("encryptedNewRefreshToken");
            when(encriptadoUtil.encriptar("newPublicKey")).thenReturn("encryptedNewPublicKey");
            when(oauthRepository.save(any(OauthToken.class))).thenReturn(testOauthToken);

            // When
            oauthService.guardarTokenNuevo(testTokenDTO, 1L, 10L, TipoServicioEnum.GASTRONOMICO);

            // Then
            verify(oauthRepository).save(testOauthToken); // Reutiliza el existente
        }
    }

    @Nested
    @DisplayName("Tests de actualizarToken")
    class ActualizarTokenTests {

        @Test
        @DisplayName("Debe actualizar token existente por negocio")
        void actualizarToken_ConTokenExistente_ActualizaCorrectamente() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO))
                    .thenReturn(Optional.of(testOauthToken));
            when(encriptadoUtil.encriptar("newAccessToken")).thenReturn("encryptedNewAccessToken");
            when(encriptadoUtil.encriptar("newRefreshToken")).thenReturn("encryptedNewRefreshToken");
            when(encriptadoUtil.encriptar("newPublicKey")).thenReturn("encryptedNewPublicKey");
            when(oauthRepository.save(any(OauthToken.class))).thenReturn(testOauthToken);

            // When
            oauthService.actualizarToken(testTokenDTO, 10L, TipoServicioEnum.GASTRONOMICO);

            // Then
            verify(oauthRepository).findByExternalBusinessIdAndTipoServicio(10L, TipoServicioEnum.GASTRONOMICO);
            verify(oauthRepository).save(any(OauthToken.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si token del negocio no existe")
        void actualizarToken_ConTokenNoExistente_LanzaExcepcion() {
            // Given
            when(oauthRepository.findByExternalBusinessIdAndTipoServicio(999L, TipoServicioEnum.HOSPEDAJE))
                    .thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> oauthService.actualizarToken(testTokenDTO, 999L, TipoServicioEnum.HOSPEDAJE)
            );
            assertEquals("Token no encontrado para el negocio", exception.getMessage());
            verify(oauthRepository, never()).save(any(OauthToken.class));
        }
    }

    @Nested
    @DisplayName("Tests de validación de token")
    class ValidacionTokenTests {

        @Test
        @DisplayName("Token con fecha de expiración futura es válido")
        void token_ConFechaFutura_EsValido() {
            // Given
            testOauthToken.setExpiresAt(LocalDateTime.now().plusHours(6));

            // Then
            assertTrue(testOauthToken.getExpiresAt().isAfter(LocalDateTime.now()));
        }

        @Test
        @DisplayName("Token con fecha de expiración pasada es inválido")
        void token_ConFechaPasada_EsInvalido() {
            // Given
            testOauthToken.setExpiresAt(LocalDateTime.now().minusHours(1));

            // Then
            assertTrue(testOauthToken.getExpiresAt().isBefore(LocalDateTime.now()));
        }
    }
}
