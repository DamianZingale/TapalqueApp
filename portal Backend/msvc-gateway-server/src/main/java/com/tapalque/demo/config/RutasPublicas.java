package com.tapalque.demo.config;

import java.util.List;

public class RutasPublicas {
    public static final List<String> LISTA = List.of(
        "/api/jwt/login",
        "/api/jwt/register",
        "/api/jwt/refresh",
        "/api/user/register",
        "/api/user/exists"
    );
}
