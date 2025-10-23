package com.tapalque.jwt.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    public enum Token_Type {
        BEARER
    }
}