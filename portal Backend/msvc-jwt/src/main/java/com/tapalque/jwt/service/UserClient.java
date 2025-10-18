package com.tapalque.jwt.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.tapalque.jwt.dto.UserResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserClient {
    private final WebClient.Builder webClientBuilder;

    public UserResponseDTO getUser(String email) {
        return webClientBuilder.build()
            .get()
            .uri("http://msvc-user/api/users/email/" + email)
            .retrieve()
            .bodyToMono(UserResponseDTO.class)
            .block();
    }
}