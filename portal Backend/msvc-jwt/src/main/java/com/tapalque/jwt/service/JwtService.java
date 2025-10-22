package com.tapalque.jwt.service;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.tapalque.jwt.dto.UserResponseDTO;

import io.jsonwebtoken.Jwts;
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

    private final UserClient userClient;

    public String extractEmail(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .setAllowedClockSkewSeconds(60) // evita errores por diferencias de hora
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            throw new RuntimeException("Token con firma inválida", ex);
        } catch (Exception ex) {
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
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .claim("fullName", user.getFirtName()+" "+user.getLastName())
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        UserResponseDTO user = userClient.getUser(extractEmail(token));
        final String email = extractEmail(token);
        return (email.equals(user.getEmail())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String obtenerNombreDeUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String nombreDeUsuario = ((UserDetails) auth.getPrincipal()).getUsername();
        return nombreDeUsuario;
    }
}