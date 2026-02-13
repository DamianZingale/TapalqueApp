package com.tapalque.termas.Exceptions;

public class TermaNotFoundException extends RuntimeException {
    public TermaNotFoundException(Long id) {
        super("Terma con ID " + id + " no encontrado");
    }
}