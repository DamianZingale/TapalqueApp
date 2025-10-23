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

            //Rutas publicas que debe permitir el gateway
            List<String> publicPaths = List.of(
                    "/api/user/register",
                    "/api/user/exists",
                    "/api/jwt/",
                    "/api/public",
                    "/api/user/email/");

            //Si es publica permite el ingreso
            boolean esRutaPublica = publicPaths.stream()
                    .anyMatch(path::startsWith);
            if (esRutaPublica) {
                return chain.filter(exchange);
            }

            //Chequea el token
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            //Perimte el request y continua al Microserv
            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}