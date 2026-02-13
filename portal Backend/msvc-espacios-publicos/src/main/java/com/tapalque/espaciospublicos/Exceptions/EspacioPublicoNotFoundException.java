package com.tapalque.espaciospublicos.Exceptions;

public class EspacioPublicoNotFoundException extends RuntimeException {
    public EspacioPublicoNotFoundException(Long id) {
        super("Espacio público no encontrado con id: " + id);
    }
}
