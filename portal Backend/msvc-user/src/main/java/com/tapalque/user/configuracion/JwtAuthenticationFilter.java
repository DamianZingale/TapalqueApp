package com.tapalque.user.configuracion;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final WebClient.Builder webClientBuilder;

    public JwtAuthenticationFilter(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1️⃣ RUTAS PÚBLICAS → NO VALIDAR JWT
        if (path.startsWith("/user/public") || path.startsWith("/jwt/public")) {  // ← CORREGIDO: sin /api
            filterChain.doFilter(request, response);
            return;
        }

        // 2️⃣ Header Authorization
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 3️⃣ Validar token con msvc-jwt
        Map<String, String> datos = webClientBuilder.build()
                .post()
                .uri("lb://msvc-jwt/api/jwt/public/validate")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {})
                .onErrorReturn(Map.of())
                .block();

        if (!datos.containsKey("email") || !datos.containsKey("rol")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 4️⃣ Autenticación en Spring Security
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        datos.get("email"),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + datos.get("rol")))
                );

        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}