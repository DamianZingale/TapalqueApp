package com.tapalque.termas.controller;

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

import com.tapalque.termas.dto.ImagenResponseDTO;
import com.tapalque.termas.dto.TermaImagenRequestDTO;
import com.tapalque.termas.service.TermaImagenService;


@RestController
@RequestMapping("/terma")
public class TermaImagenController {

   
    private final TermaImagenService cImagenService;
    public TermaImagenController(TermaImagenService cImagenService) {
        this.cImagenService = cImagenService;


    }
    // Agregar imagen
    @PostMapping(value = "/{termaId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> agregarImagen(
            @PathVariable Long termaId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("📸 Imagen recibida para terma ID: " + termaId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cImagenService.agregarImagen(termaId, file));
    }

    // Listar imágenes
    @GetMapping("/{termaId}/imagenes")
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long termaId) {
        return ResponseEntity.ok(cImagenService.listarImagenes(termaId));
    }
    

    // Eliminar imagen
    @DeleteMapping("/{termaId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(@PathVariable Long termaId,
            @RequestBody TermaImagenRequestDTO dto) {
        cImagenService.eliminarImagen(termaId, dto);
        return ResponseEntity.noContent().build();
    }

}