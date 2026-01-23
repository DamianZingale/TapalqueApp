package com.tapalque.espaciospublicos.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.espaciospublicos.dto.EspacioPublicoRequestDTO;
import com.tapalque.espaciospublicos.dto.EspacioPublicoResponseDTO;
import com.tapalque.espaciospublicos.service.EspacioPublicoService;

@RestController
@RequestMapping("/espacio-publico")
public class EspacioPublicoController {
    private final EspacioPublicoService espacioPublicoService;

    public EspacioPublicoController(EspacioPublicoService espacioPublicoService) {
        this.espacioPublicoService = espacioPublicoService;
    }

    // Crear espacio público
    @PostMapping
    public ResponseEntity<EspacioPublicoResponseDTO> crear(@RequestBody EspacioPublicoRequestDTO dto) {
        EspacioPublicoResponseDTO creado = espacioPublicoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<EspacioPublicoResponseDTO>> listar(
            @RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(espacioPublicoService.obtenerPorCategoria(categoria));
        }
        return ResponseEntity.ok(espacioPublicoService.obtenerTodos());
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<EspacioPublicoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(espacioPublicoService.obtenerPorId(id));
    }

    // Actualizar completo (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<EspacioPublicoResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody EspacioPublicoRequestDTO dto) {
        return ResponseEntity.ok(espacioPublicoService.actualizarCompleto(id, dto));
    }

    // Actualizar parcial (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<EspacioPublicoResponseDTO> actualizarParcial(@PathVariable Long id,
            @RequestBody EspacioPublicoRequestDTO dto) {
        return ResponseEntity.ok(espacioPublicoService.actualizarParcial(id, dto));
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        espacioPublicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
