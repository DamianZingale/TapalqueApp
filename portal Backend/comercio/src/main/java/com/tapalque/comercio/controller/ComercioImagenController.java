package com.tapalque.comercio.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import com.tapalque.comercio.dto.ComercioImagenRequestDTO;
import com.tapalque.comercio.dto.ImagenResponseDTO;
import com.tapalque.comercio.service.ComercioImagenService;

@RestController
@RequestMapping("/api/comercio/{comercioId}/imagenes")
public class ComercioImagenController {

    @Autowired
    private ComercioImagenService cImagenService;

    // Agregar imagen (subida de archivo)
    @PostMapping
    public ResponseEntity<ImagenResponseDTO> agregarImagen(@PathVariable Long comercioId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cImagenService.agregarImagen(comercioId, file));
    }

    // Listar imágenes de un comercio
    @GetMapping
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long comercioId) {
        return ResponseEntity.ok(cImagenService.listarImagenes(comercioId));
    }

    // Eliminar imagen (pasando la URL en el body)
    @DeleteMapping
    public ResponseEntity<Void> eliminarImagen(@PathVariable Long comercioId,
            @RequestBody ComercioImagenRequestDTO dto) {
        cImagenService.eliminarImagen(comercioId, dto);
        return ResponseEntity.noContent().build();
    }
}