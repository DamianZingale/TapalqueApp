package com.tapalque.jwt.configuracion;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.tapalque.jwt.repository.TokenRepository;
import com.tapalque.jwt.service.JwtService;
import com.tapalque.jwt.entity.Usuario;
import com.tapalque.jwt.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtServicio;
    private final UserDetailsService userDetailsService;
    private final TokenRepository tokenRepositorio;
    private final UsuarioRepository usuarioRepositorio;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (request.getServletPath().startsWith("/auth/") ||
                HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String jwt = authHeader.substring(7);
        final String nombreDeUsuario = jwtServicio.extractUsername(jwt);
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (nombreDeUsuario == null || authentication != null) {
            filterChain.doFilter(request, response);
            return;
        }
        final UserDetails userDetails = this.userDetailsService.loadUserByUsername(nombreDeUsuario);
        final boolean isTokenActive = tokenRepositorio.findByToken(jwt)
                .map(token -> !token.getExpired() && !token.getRevoked())
                .orElse(false);
        if (isTokenActive) {
            final Optional<Usuario> user = usuarioRepositorio.findByNombreDeUsuario(nombreDeUsuario);
            if (user.isPresent()) {
                final boolean isTokenValid = jwtServicio.isTokenValid(jwt, user.get());
                if (isTokenValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        // Continua con el resto de filtros en la cadena
        filterChain.doFilter(request, response);
    }
}
