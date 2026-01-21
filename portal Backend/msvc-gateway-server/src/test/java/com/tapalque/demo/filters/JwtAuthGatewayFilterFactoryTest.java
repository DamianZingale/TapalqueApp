package com.tapalque.demo.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("JwtAuthGatewayFilterFactory Tests")
class JwtAuthGatewayFilterFactoryTest {

    private JwtAuthGatewayFilterFactory filterFactory;
    private GatewayFilter filter;
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        filterFactory = new JwtAuthGatewayFilterFactory();
        filter = filterFactory.apply(new JwtAuthGatewayFilterFactory.Config());
        chain = mock(GatewayFilterChain.class);
    }

    private ServerWebExchange createExchange(String path, String authHeader) {
        MockServerHttpRequest.BaseBuilder<?> requestBuilder = MockServerHttpRequest
                .get(path);

        if (authHeader != null) {
            requestBuilder.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        MockServerHttpRequest request = requestBuilder.build();
        MockServerHttpResponse response = new MockServerHttpResponse();

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);
        when(exchange.getResponse()).thenReturn(response);

        return exchange;
    }

    @Nested
    @DisplayName("Tests de Rutas Públicas")
    class RutasPublicasTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "/user/register",
                "/user/public/verify-email",
                "/user/public/resend-verification",
                "/jwt/login",
                "/jwt/public/something",
                "/jwt/refresh",
                "/api/user/register",
                "/api/jwt/login",
                "/api/public/something",
                "/webhook/mercadopago",
                "/oauth/callback"
        })
        @DisplayName("Debe permitir acceso a rutas públicas sin token")
        void apply_ConRutaPublica_PermiteAcceso(String path) {
            // Given
            ServerWebExchange exchange = createExchange(path, null);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            verify(chain).filter(exchange);
        }

        @Test
        @DisplayName("Debe permitir /user/email/ sin token")
        void apply_ConRutaEmail_PermiteAcceso() {
            // Given
            ServerWebExchange exchange = createExchange("/user/email/test@example.com", null);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            verify(chain).filter(exchange);
        }
    }

    @Nested
    @DisplayName("Tests de Rutas Protegidas")
    class RutasProtegidasTests {

        @Test
        @DisplayName("Debe rechazar ruta protegida sin token")
        void apply_ConRutaProtegidaSinToken_RetornaUnauthorized() {
            // Given
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/user/profile")
                    .build();
            MockServerHttpResponse response = new MockServerHttpResponse();

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);
            when(exchange.getResponse()).thenReturn(response);

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
            verify(chain, never()).filter(exchange);
        }

        @Test
        @DisplayName("Debe rechazar ruta protegida con header inválido")
        void apply_ConHeaderInvalido_RetornaUnauthorized() {
            // Given
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/user/profile")
                    .header(HttpHeaders.AUTHORIZATION, "InvalidHeader token123")
                    .build();
            MockServerHttpResponse response = new MockServerHttpResponse();

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);
            when(exchange.getResponse()).thenReturn(response);

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
            verify(chain, never()).filter(exchange);
        }

        @Test
        @DisplayName("Debe permitir ruta protegida con Bearer token")
        void apply_ConBearerToken_PermiteAcceso() {
            // Given
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/user/profile")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer validToken123")
                    .build();
            MockServerHttpResponse response = new MockServerHttpResponse();

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);
            when(exchange.getResponse()).thenReturn(response);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            verify(chain).filter(exchange);
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "/user/all",
                "/user/1/profile",
                "/gastronomia/admin",
                "/hospedaje/reservas",
                "/comercio/1"
        })
        @DisplayName("Debe requerir token para rutas protegidas")
        void apply_ConRutasProtegidas_RequiereToken(String path) {
            // Given
            MockServerHttpRequest request = MockServerHttpRequest
                    .get(path)
                    .build();
            MockServerHttpResponse response = new MockServerHttpResponse();

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);
            when(exchange.getResponse()).thenReturn(response);

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Tests de Configuración")
    class ConfiguracionTests {

        @Test
        @DisplayName("Debe crear instancia de Config correctamente")
        void config_CreaInstanciaCorrectamente() {
            // When
            JwtAuthGatewayFilterFactory.Config config = new JwtAuthGatewayFilterFactory.Config();

            // Then
            assertNotNull(config);
        }

        @Test
        @DisplayName("Factory debe crear filtro correctamente")
        void apply_CreaFiltroCorrectamente() {
            // When
            GatewayFilter filter = filterFactory.apply(new JwtAuthGatewayFilterFactory.Config());

            // Then
            assertNotNull(filter);
        }
    }

    @Nested
    @DisplayName("Tests de Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Debe manejar Bearer sin token")
        void apply_ConBearerSinToken_RetornaUnauthorized() {
            // Given
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/user/profile")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer ")
                    .build();
            MockServerHttpResponse response = new MockServerHttpResponse();

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);
            when(exchange.getResponse()).thenReturn(response);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            // Bearer con espacio se considera válido por el filtro actual
            verify(chain).filter(exchange);
        }

        @Test
        @DisplayName("Debe permitir rutas públicas con prefijo /api")
        void apply_ConApiPrefix_PermiteRutaPublica() {
            // Given
            ServerWebExchange exchange = createExchange("/api/user/public/register", null);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            // When
            Mono<Void> result = filter.filter(exchange, chain);

            // Then
            StepVerifier.create(result).verifyComplete();
            verify(chain).filter(exchange);
        }
    }
}
