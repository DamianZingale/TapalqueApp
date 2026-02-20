package com.tapalque.jwt.service;

import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.tapalque.jwt.dto.UserResponseDTO;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class JwtService {
    @Value("${secretKeyEncriptar}")
    private String secretKey;

    @Value("${expiration}")
    private long jwtExpiration;

    @Value("${token.expiration}")
    private long refreshExpiration;

    public String extractEmail(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignInKey())
                    .clockSkewSeconds(60) // evita errores por diferencias de hora
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            throw new RuntimeException("Token con firma inválida", ex);
        } catch (ExpiredJwtException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
            throw new RuntimeException("Error al parsear token", ex);
        }
    }

    public String generateToken(final UserResponseDTO user) {
        return buildToken(user, jwtExpiration);
    }

    public String generateRefreshToken(final UserResponseDTO user) {
        return buildToken(user, refreshExpiration);
    }

    private String buildToken(final UserResponseDTO user, final long expiration) {
        return Jwts
                .builder()
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .claim("fullName", user.getFirtName())
                .claim("rol", user.getRol().name())
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    @SuppressWarnings("unused")
    private Date extractExpiration(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String obtenerNombreDeUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String nombreDeUsuario = ((UserDetails) auth.getPrincipal()).getUsername();
        return nombreDeUsuario;
    }

}
