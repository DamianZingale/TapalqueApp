package com.tapalque.jwt.service;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 300; // 5 minutos

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) {
            return false;
        }
        if (info.blockedUntil != null && Instant.now().isBefore(info.blockedUntil)) {
            return true;
        }
        // Si el bloqueo expiró, limpiar
        if (info.blockedUntil != null && Instant.now().isAfter(info.blockedUntil)) {
            attempts.remove(ip);
            return false;
        }
        return false;
    }

    public int getRemainingAttempts(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - info.failedAttempts);
    }

    public void loginFailed(String ip) {
        AttemptInfo info = attempts.computeIfAbsent(ip, k -> new AttemptInfo());
        info.failedAttempts++;
        info.lastAttempt = Instant.now();

        if (info.failedAttempts >= MAX_ATTEMPTS) {
            info.blockedUntil = Instant.now().plusSeconds(BLOCK_DURATION_SECONDS);
        }
    }

    public void loginSucceeded(String ip) {
        attempts.remove(ip);
    }

    @Scheduled(fixedRate = 600000) // Cada 10 minutos
    public void cleanupExpiredEntries() {
        Instant now = Instant.now();
        Iterator<Map.Entry<String, AttemptInfo>> it = attempts.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, AttemptInfo> entry = it.next();
            AttemptInfo info = entry.getValue();
            // Limpiar si el bloqueo expiró o si no hay actividad por más de 1 hora
            if ((info.blockedUntil != null && now.isAfter(info.blockedUntil))
                    || (info.lastAttempt != null && now.isAfter(info.lastAttempt.plusSeconds(3600)))) {
                it.remove();
            }
        }
    }

    private static class AttemptInfo {
        int failedAttempts = 0;
        Instant blockedUntil = null;
        Instant lastAttempt = null;
    }
}
