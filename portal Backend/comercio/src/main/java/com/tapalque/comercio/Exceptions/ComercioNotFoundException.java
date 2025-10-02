package com.tapalque.comercio.Exceptions;

public class ComercioNotFoundException extends RuntimeException {
    public ComercioNotFoundException(Long id) {
        super("Comercio con ID " + id + " no encontrado");
    }
}