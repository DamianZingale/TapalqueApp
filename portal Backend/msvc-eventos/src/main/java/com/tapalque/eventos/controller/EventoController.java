package com.tapalque.eventos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("api/comercio")
public class EventoController {
    @Autowired
    private EventoService comercioService;

    // Crear comercio
    @PostMapping
    public ResponseEntity<EventoResponseDTO> crearComercio(@RequestBody EventoRequestDTO dto) {
        EventoResponseDTO creado = comercioService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<EventoResponseDTO>> listarComercios() {
        return ResponseEntity.ok(comercioService.obtenerTodos());
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(comercioService.obtenerPorId(id));
    }

    // Actualizar completo (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody EventoRequestDTO dto) {
        return ResponseEntity.ok(comercioService.actualizarCompleto(id, dto));
    }

    // Actualizar parcial (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> actualizarParcial(@PathVariable Long id,
            @RequestBody EventoRequestDTO dto) {
        return ResponseEntity.ok(comercioService.actualizarParcial(id, dto));
    }

    // Eliminar comercio
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        comercioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}