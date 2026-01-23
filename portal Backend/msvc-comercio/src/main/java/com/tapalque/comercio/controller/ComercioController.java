package com.tapalque.comercio.controller;

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

import com.tapalque.comercio.dto.ComercioRequestDTO;
import com.tapalque.comercio.dto.ComercioResponseDTO;
import com.tapalque.comercio.service.ComercioService;

@RestController
@RequestMapping("/comercio")
public class ComercioController {
    @Autowired
    private ComercioService comercioService;

    // Crear comercio
    @PostMapping
    public ResponseEntity<ComercioResponseDTO> crearComercio(@RequestBody ComercioRequestDTO dto) {
        ComercioResponseDTO creado = comercioService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Listar todos
    @GetMapping("/list")
    public ResponseEntity<List<ComercioResponseDTO>> listarComercios() {
        return ResponseEntity.ok(comercioService.obtenerTodos());
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<ComercioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(comercioService.obtenerPorId(id));
    }

    // Actualizar completo (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<ComercioResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody ComercioRequestDTO dto) {
        return ResponseEntity.ok(comercioService.actualizarCompleto(id, dto));
    }

    // Actualizar parcial (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<ComercioResponseDTO> actualizarParcial(@PathVariable Long id,
            @RequestBody ComercioRequestDTO dto) {
        return ResponseEntity.ok(comercioService.actualizarParcial(id, dto));
    }

    // Eliminar comercio
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        comercioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}