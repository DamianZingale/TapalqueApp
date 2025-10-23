package com.tapalque.demo.filters;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    public JwtAuthGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            System.out.println("El Path que llega al gatewat Filter: "+path);

            if (path.startsWith("/api/user/register") ||
                path.startsWith("/api/user/exists") ||
                path.startsWith("/api/jwt/") ||
                path.startsWith("/api/public")||
                path.startsWith("/api/user/email/")) {
                    System.out.println("Entra a IF rutas publicas!");
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                System.out.println("Entra a If que rechaza");
                return exchange.getResponse().setComplete();
            }
            System.out.println("Autoriza el token");
            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}