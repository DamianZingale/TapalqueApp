package com.tapalque.jwt.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tokens_tb")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @Builder.Default
    private Token_Type tokenType = Token_Type.BEARER;

    private Boolean revoked;
    private Boolean expired;

    @Column(nullable = false)
    private String email; // email del usuario dueño del token

    public enum Token_Type {
        BEARER
    }
}