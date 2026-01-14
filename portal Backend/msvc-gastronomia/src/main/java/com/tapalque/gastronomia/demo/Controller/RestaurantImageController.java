package com.tapalque.gastronomia.demo.Controller;

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

import com.tapalque.gastronomia.demo.DTO.ImagenRequestDTO;
import com.tapalque.gastronomia.demo.DTO.ImagenResponseDTO;
import com.tapalque.gastronomia.demo.Service.RestaurantImageService;

@RestController
@RequestMapping("/restaurante")
public class RestaurantImageController {

    @Autowired
    private RestaurantImageService imageService;

    /**
     * Agregar imagen a un restaurante
     */
    @PostMapping(value = "/{restaurantId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> agregarImagen(
            @PathVariable Long restaurantId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("📸 Imagen recibida para restaurante ID: " + restaurantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.agregarImagen(restaurantId, file));
    }

    /**
     * Listar imágenes de un restaurante
     */
    @GetMapping("/{restaurantId}/imagenes")
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(imageService.listarImagenes(restaurantId));
    }

    /**
     * Eliminar imagen de un restaurante
     */
    @DeleteMapping("/{restaurantId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable Long restaurantId,
            @RequestBody ImagenRequestDTO dto) {
        imageService.eliminarImagen(restaurantId, dto);
        return ResponseEntity.noContent().build();
    }
}
