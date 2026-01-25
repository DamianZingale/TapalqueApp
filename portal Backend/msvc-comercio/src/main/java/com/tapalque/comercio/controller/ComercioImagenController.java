package com.tapalque.comercio.controller;

import java.util.List;

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

import com.tapalque.comercio.dto.ComercioImagenRequestDTO;
import com.tapalque.comercio.dto.ImagenResponseDTO;
import com.tapalque.comercio.service.ComercioImagenService;

@RestController
@RequestMapping("/comercio")
public class ComercioImagenController {

  
    private final ComercioImagenService cImagenService;
    public ComercioImagenController(ComercioImagenService cImagenService) {
        this.cImagenService = cImagenService;
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
            @RequestBody ComercioImagenRequestDTO dto) {

        cImagenService.eliminarImagen(comercioId, dto);
        return ResponseEntity.noContent().build();  
            }

}