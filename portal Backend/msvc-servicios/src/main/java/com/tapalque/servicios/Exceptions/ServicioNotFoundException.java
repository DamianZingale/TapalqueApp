package com.tapalque.servicios.Exceptions;

public class ServicioNotFoundException extends RuntimeException {
    public ServicioNotFoundException(Long id) {
        super("Servicio con ID " + id + " no encontrado");
    }
}