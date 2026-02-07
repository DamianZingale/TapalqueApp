package com.tapalque.hosteleria.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Recursos estáticos (imágenes)
                        .requestMatchers("/uploads/**").permitAll()
                        // GET públicos - ver hospedajes, habitaciones, disponibilidad
                        .requestMatchers(HttpMethod.GET, "/hospedajes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/habitaciones/**").permitAll()
                        // Crear/modificar requiere autenticación (para Mercado Pago)
                        .requestMatchers(HttpMethod.POST, "/hospedajes/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/hospedajes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/habitaciones/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/habitaciones/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/habitaciones/**").authenticated()
                        // Eliminar requiere rol ADMINISTRADOR o MODERADOR
                        .requestMatchers(HttpMethod.DELETE, "/hospedajes/**").hasAnyRole("ADMINISTRADOR", "MODERADOR")
                        .requestMatchers(HttpMethod.DELETE, "/habitaciones/**").hasAnyRole("ADMINISTRADOR", "MODERADOR")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
