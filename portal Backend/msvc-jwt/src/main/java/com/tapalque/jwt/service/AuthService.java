package com.tapalque.jwt.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.tapalque.jwt.dto.AuthRequestDTO;
import com.tapalque.jwt.dto.TokenResponse;
import com.tapalque.jwt.dto.UserResponseDTO;
import com.tapalque.jwt.entity.Token;
import com.tapalque.jwt.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TokenRepository tokenRepositorio;
    private final JwtService jwtServicio;
    private final AuthenticationManager authenticationManager;
    private final UserClient userClient;

    public TokenResponse authenticate(final AuthRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getContrasena()));

        final UserResponseDTO user = userClient.getUser(request.getEmail());
        final String accessToken = jwtServicio.generateToken(user);
        final String refreshToken = jwtServicio.generateRefreshToken(user);

        revokeAllUserTokens(user.getEmail());
        saveUserToken(user.getEmail(), accessToken);

        return new TokenResponse(accessToken, refreshToken, user.getEmail());
    }

    private void saveUserToken(String email, String jwtToken) {
        final Token token = Token.builder()
                .email(email)
                .token(jwtToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepositorio.save(token);
    }

    private void revokeAllUserTokens(final String email) {
        final List<Token> validUserTokens = tokenRepositorio
                .findByEmailAndExpiredFalseAndRevokedFalse(email);
        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepositorio.saveAll(validUserTokens);
        }
    }

    public TokenResponse refreshToken(final String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid auth header");
        }

        final String refreshToken = authHeader.substring(7);
        final String email = jwtServicio.extractEmail(refreshToken);
        if (email == null) return null;

        final UserResponseDTO user = userClient.getUser(email);
        final boolean isTokenValid = jwtServicio.isTokenValid(refreshToken);

        if (!isTokenValid) return null;

        final String accessToken = jwtServicio.generateToken(user);
        revokeAllUserTokens(email);
        saveUserToken(email, accessToken);

        return new TokenResponse(accessToken, refreshToken, email);
    }
}
