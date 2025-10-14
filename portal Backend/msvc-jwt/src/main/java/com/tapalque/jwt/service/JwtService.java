package com.tapalque.jwt.service;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.tapalque.jwt.entity.Usuario;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${secretKeyEncriptar}")
    public String secretKey;

    @Value("${expiration}")
    private long jwtExpiration;

    @Value("${token.expiration}")
    private long refreshExpiration;

    public String extractUsername(String token) {
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

    public String generateToken(final Usuario user) {
        return buildToken(user, jwtExpiration);
    }

    public String generateRefreshToken(final Usuario user) {
        return buildToken(user, refreshExpiration);
    }

    private String buildToken(final Usuario user, final long expiration) {
        return Jwts
                .builder()
                .setSubject(user.getNombreDeUsuario())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .claim("name", user.getNombre())
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, Usuario user) {
        final String username = extractUsername(token);
        return (username.equals(user.getNombreDeUsuario())) && !isTokenExpired(token);
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