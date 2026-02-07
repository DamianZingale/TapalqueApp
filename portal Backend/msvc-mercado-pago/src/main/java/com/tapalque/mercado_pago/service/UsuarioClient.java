package com.tapalque.mercado_pago.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.tapalque.mercado_pago.dto.UserResponseDTO;

import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UsuarioClient {

    private final WebClient.Builder webClientBuilder;

    public Mono<UserResponseDTO> obtenerUsuarioPorEmail(String email) {
        return webClientBuilder.build()
            .get()
            .uri("lb://MSVC-USER/user/email/" + email)
            .retrieve()
            .bodyToMono(UserResponseDTO.class);
    }
}