package com.tapalque.eventos.Exceptions;

public class EventoNotFoundException extends RuntimeException {
    public EventoNotFoundException(Long id) {
        super("Evento con ID " + id + " no encontrado");
    }
}