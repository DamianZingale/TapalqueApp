package com.tapalque.jwt.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tapalque.jwt.entity.Usuario;
import com.tapalque.jwt.repository.UsuarioRepository;
import com.tapalque.jwt.dto.AuthRequestDTO;
import com.tapalque.jwt.dto.TokenResponse;
import com.tapalque.jwt.dto.UsuarioRequestDTO;
import com.tapalque.jwt.entity.Token;
import com.tapalque.jwt.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepositorio;
    private final TokenRepository tokenRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtServicio;
    private final AuthenticationManager authenticationManager;

    public TokenResponse register(final UsuarioRequestDTO request) {
        final Usuario user = Usuario.builder()
                .nombreDeUsuario(request.getNombreDeUsuario())
                .correo(request.getCorreo())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .nombreEmpresa(request.getEmpresa())
                .build();
        final Usuario savedUser = usuarioRepositorio.save(user);
        final String jwtToken = jwtServicio.generateToken(savedUser);
        final String refreshToken = jwtServicio.generateRefreshToken(savedUser);
        saveUserToken(savedUser, jwtToken);
        return new TokenResponse(jwtToken, refreshToken, user.getNombreDeUsuario());
    }

    public TokenResponse authenticate(final AuthRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getNombreDeUsuario(),
                        request.getContrasena()));
        final Usuario user = usuarioRepositorio.findByNombreDeUsuario(request.getNombreDeUsuario())
                .orElseThrow();
        final String accessToken = jwtServicio.generateToken(user);
        final String refreshToken = jwtServicio.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);
        return new TokenResponse(accessToken, refreshToken, user.getNombreDeUsuario());
    }

    private void saveUserToken(Usuario user, String jwtToken) {
        final Token token = Token.builder()
                .usuario(user)
                .token(jwtToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepositorio.save(token);
    }

    private void revokeAllUserTokens(final Usuario user) {
        final List<Token> validUserTokens = tokenRepositorio
                .findByUsuarioIdAndExpiredFalseAndRevokedFalse(user.getId());
        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setExpired(true);
                token.setRevoked(true);
            });
            tokenRepositorio.saveAll(validUserTokens);
        }
    }

    public TokenResponse refreshToken(final String authentication) {
        if (authentication == null || !authentication.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid auth header");
        }
        final String refreshToken = authentication.substring(7);
        final String userName = jwtServicio.extractUsername(refreshToken);
        if (userName == null) {
            return null;
        }
        final Usuario user = this.usuarioRepositorio.findByNombreDeUsuario(userName).orElseThrow();
        final boolean isTokenValid = jwtServicio.isTokenValid(refreshToken, user);
        if (!isTokenValid) {
            return null;
        }
        final String accessToken = jwtServicio.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);
        return new TokenResponse(accessToken, refreshToken, user.getNombreDeUsuario());
    }
}
