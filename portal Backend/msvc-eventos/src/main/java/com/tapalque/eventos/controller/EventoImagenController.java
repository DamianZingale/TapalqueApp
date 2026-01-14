package com.tapalque.eventos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.eventos.dto.EventoImagenRequestDTO;
import com.tapalque.eventos.dto.ImagenResponseDTO;
import com.tapalque.eventos.service.EventoImagenService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/comercio")
public class EventoImagenController {

    @Autowired
    private EventoImagenService cImagenService;

    @GetMapping("/test")
    public ResponseEntity<String> eliminarImagen() {
        return ResponseEntity.ok("EL TEST ANDA");
    }
    // Agregar imagen
    @PostMapping(value = "/{comercioId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> agregarImagen(
            @PathVariable Long comercioId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("📸 Imagen recibida para comercio ID: " + comercioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cImagenService.agregarImagen(comercioId, file));
    }

    // Listar imágenes
    @GetMapping("/{comercioId}/imagenes")
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long comercioId) {
        return ResponseEntity.ok(cImagenService.listarImagenes(comercioId));
    }
    

    // Eliminar imagen
    @DeleteMapping("/{comercioId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(@PathVariable Long comercioId,
            @RequestBody EventoImagenRequestDTO dto) {

        System.out.println("LLega a endpoint");
        cImagenService.eliminarImagen(comercioId, dto);
        return ResponseEntity.noContent().build();
    }

    @PostConstruct
    public void init() {
        System.out.println("✅ EventoImagenController inicializado");
    }
}