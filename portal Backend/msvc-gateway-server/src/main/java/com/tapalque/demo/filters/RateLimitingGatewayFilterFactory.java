package com.tapalque.demo.filters;

import java.time.Instant;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;

@Component
public class RateLimitingGatewayFilterFactory extends AbstractGatewayFilterFactory<RateLimitingGatewayFilterFactory.Config> {

    private final ConcurrentHashMap<String, List<Instant>> requestCounts = new ConcurrentHashMap<>();

    public RateLimitingGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("maxRequests", "windowSeconds");
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String clientIp = extractClientIp(exchange);
            String path = exchange.getRequest().getURI().getPath();
            String key = clientIp + ":" + path;

            List<Instant> timestamps = requestCounts.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());

            Instant now = Instant.now();
            Instant windowStart = now.minusSeconds(config.getWindowSeconds());

            // Limpiar timestamps fuera de la ventana
            timestamps.removeIf(t -> t.isBefore(windowStart));

            if (timestamps.size() >= config.getMaxRequests()) {
                System.out.println("⛔ Rate limit excedido para IP: " + clientIp + " en ruta: " + path);
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                exchange.getResponse().getHeaders().add("Retry-After", String.valueOf(config.getWindowSeconds()));
                exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                byte[] body = ("{\"error\":\"Demasiadas solicitudes\",\"detalle\":\"Has excedido el limite de "
                        + config.getMaxRequests() + " solicitudes. Intenta de nuevo en "
                        + config.getWindowSeconds() + " segundos.\"}").getBytes();
                return exchange.getResponse().writeWith(
                        Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
            }

            timestamps.add(now);

            int remaining = config.getMaxRequests() - timestamps.size();
            exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(config.getMaxRequests()));
            exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", String.valueOf(remaining));

            return chain.filter(exchange);
        };
    }

    private String extractClientIp(org.springframework.web.server.ServerWebExchange exchange) {
        String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        var remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        return "unknown";
    }

    @Scheduled(fixedRate = 300000) // Cada 5 minutos
    public void cleanupExpiredEntries() {
        Instant cutoff = Instant.now().minusSeconds(3600); // Limpiar entradas de más de 1 hora
        Iterator<java.util.Map.Entry<String, List<Instant>>> it = requestCounts.entrySet().iterator();
        while (it.hasNext()) {
            java.util.Map.Entry<String, List<Instant>> entry = it.next();
            entry.getValue().removeIf(t -> t.isBefore(cutoff));
            if (entry.getValue().isEmpty()) {
                it.remove();
            }
        }
    }

    public static class Config {
        private int maxRequests = 10;
        private int windowSeconds = 60;

        public int getMaxRequests() {
            return maxRequests;
        }

        public void setMaxRequests(int maxRequests) {
            this.maxRequests = maxRequests;
        }

        public int getWindowSeconds() {
            return windowSeconds;
        }

        public void setWindowSeconds(int windowSeconds) {
            this.windowSeconds = windowSeconds;
        }
    }
}
