package com.tapalque.demo.filters;

import java.util.List;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    public JwtAuthGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            
            System.out.println("=== JWT FILTER ===");
            System.out.println("Path recibido: " + path);

            // Rutas públicas que debe permitir el gateway
            List<String> publicPaths = List.of(
                    "/user/register",           // Sin /api (ya viene sin el prefijo)
                    "/user/exists",
                    "/jwt/login",               // Login también sin /api
                    "/jwt/refresh",
                    "/api/user/register",       // Por si acaso viene con /api
                    "/api/jwt/login",
                    "/api/jwt/refresh",
                    "/api/public",
                    "/user/email/",
                    "/api/user/email/",
                    "/webhook",
                    "/api/webhook",
                    "/oauth/callback");

            // Si es pública permite el ingreso
            boolean esRutaPublica = publicPaths.stream()
                    .anyMatch(path::startsWith);
                    
            if (esRutaPublica) {
                System.out.println("✅ Ruta pública permitida: " + path);
                return chain.filter(exchange);
            }

            System.out.println("🔒 Ruta protegida, verificando token...");

            // Chequea el token
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Token no presente o inválido");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            System.out.println("✅ Token presente, permitiendo acceso");
            
            // Permite el request y continúa al Microservicio
            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}