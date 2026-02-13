package com.tapalque.espaciospublicos.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.espaciospublicos.dto.ImagenResponseDTO;
import com.tapalque.espaciospublicos.entity.EspacioPublicoImagen;
import com.tapalque.espaciospublicos.service.EspacioPublicoImagenService;

@RestController
@RequestMapping("/espacio-publico")
public class EspacioPublicoImagenController {

    
    private final EspacioPublicoImagenService imagenService;
    public EspacioPublicoImagenController( EspacioPublicoImagenService imagenService) {
        this.imagenService = imagenService;
    }

    @PostMapping("/{espacioPublicoId}/imagenes")
    public ResponseEntity<ImagenResponseDTO> subirImagen(
            @PathVariable Long espacioPublicoId,
            @RequestParam("file") MultipartFile file) throws IOException {
        EspacioPublicoImagen imagen = imagenService.guardarImagen(espacioPublicoId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ImagenResponseDTO(imagen.getImagenUrl()));
    }

    @DeleteMapping("/{imagenId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(@PathVariable Long imagenId) throws IOException {
        imagenService.eliminarImagen(imagenId);
        return ResponseEntity.noContent().build();
    }
}
