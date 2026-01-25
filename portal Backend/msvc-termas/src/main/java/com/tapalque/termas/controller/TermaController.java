package com.tapalque.termas.controller;

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

import com.tapalque.termas.dto.TermaRequestDTO;
import com.tapalque.termas.dto.TermaResponseDTO;
import com.tapalque.termas.service.TermaService;

@RestController
@RequestMapping("/terma")
public class TermaController {
    
    private final TermaService termaService;

    public TermaController(TermaService termaService) {
        this.termaService = termaService;
    }

    @PostMapping
    public ResponseEntity<TermaResponseDTO> crearTerma(@RequestBody TermaRequestDTO dto) {
        TermaResponseDTO creado = termaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    public ResponseEntity<List<TermaResponseDTO>> listarTermas() {
        return ResponseEntity.ok(termaService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(termaService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TermaResponseDTO> actualizar(@PathVariable Long id,
            @RequestBody TermaRequestDTO dto) {
        return ResponseEntity.ok(termaService.actualizarCompleto(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TermaResponseDTO> actualizarParcial(@PathVariable Long id,
            @RequestBody TermaRequestDTO dto) {
        return ResponseEntity.ok(termaService.actualizarParcial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        termaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}