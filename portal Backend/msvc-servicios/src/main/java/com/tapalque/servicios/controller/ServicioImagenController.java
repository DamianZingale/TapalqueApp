package com.tapalque.servicios.controller;

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

import com.tapalque.servicios.dto.ImagenResponseDTO;
import com.tapalque.servicios.dto.ServicioImagenRequestDTO;
import com.tapalque.servicios.service.ServicioImagenService;

@RestController
@RequestMapping("/servicio")
public class ServicioImagenController {

    
    private final ServicioImagenService cImagenService;
    public ServicioImagenController(ServicioImagenService cImagenService) {
        this.cImagenService = cImagenService;
    }


    // Agregar imagen
    @PostMapping(value = "/{servicioId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> agregarImagen(
            @PathVariable Long servicioId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("📸 Imagen recibida para servicio ID: " + servicioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cImagenService.agregarImagen(servicioId, file));
    }

    // Listar imágenes
    @GetMapping("/{servicioId}/imagenes")
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long servicioId) {
        return ResponseEntity.ok(cImagenService.listarImagenes(servicioId));
    }
    

    // Eliminar imagen
    @DeleteMapping("/{servicioId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(@PathVariable Long servicioId,
            @RequestBody ServicioImagenRequestDTO dto) {
        cImagenService.eliminarImagen(servicioId, dto);
        return ResponseEntity.noContent().build();
    }


}