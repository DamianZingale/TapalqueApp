package com.tapalque.eventos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.eventos.dto.EventoRequestDTO;
import com.tapalque.eventos.dto.EventoResponseDTO;
import com.tapalque.eventos.service.EventoService;

@RestController
@RequestMapping("/evento")
public class EventoController {
    
    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    // Crear evento
    @PostMapping
    public ResponseEntity<EventoResponseDTO> crearEvento(@RequestBody EventoRequestDTO dto) {
        EventoResponseDTO creado = eventoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<EventoResponseDTO>> listarEventos() {
        return ResponseEntity.ok(eventoService.obtenerTodos());
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.obtenerPorId(id));
    }

    // Actualizar completo (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody EventoRequestDTO dto) {
        return ResponseEntity.ok(eventoService.actualizarCompleto(id, dto));
    }

    // Actualizar parcial (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> actualizarParcial(@PathVariable Long id,
            @RequestBody EventoRequestDTO dto) {
        return ResponseEntity.ok(eventoService.actualizarParcial(id, dto));
    }

    // Eliminar evento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        eventoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}