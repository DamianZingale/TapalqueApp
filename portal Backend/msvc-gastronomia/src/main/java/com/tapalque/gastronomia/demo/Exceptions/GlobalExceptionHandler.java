package com.tapalque.gastronomia.demo.Exceptions;



import java.nio.file.AccessDeniedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 🔹 Error cuando no se encuentra una entidad (ej: buscar un id inexistente)
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorDTO> handleNotFound(EntityNotFoundException ex) {
        ErrorDTO error = new ErrorDTO(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // 🔹 Error de argumentos inválidos (ej: datos mal pasados en request)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorDTO> handleBadRequest(IllegalArgumentException ex) {
        ErrorDTO error = new ErrorDTO(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
        // 🔹 Error de acceso denegado (ej: falta de permisos)
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorDTO> handleForbidden(AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ErrorDTO(HttpStatus.FORBIDDEN.value(), ex.getMessage()));
        }

    // 🔹 Error genérico (cualquier otra excepción no controlada)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDTO> handleGeneral(Exception ex) {
        ErrorDTO error = new ErrorDTO(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
