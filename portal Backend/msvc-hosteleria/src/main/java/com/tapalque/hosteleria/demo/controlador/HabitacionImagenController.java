package com.tapalque.hosteleria.demo.controlador;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.hosteleria.demo.dto.ImagenRequestDTO;
import com.tapalque.hosteleria.demo.dto.ImagenResponseDTO;
import com.tapalque.hosteleria.demo.servicio.HabitacionImagenService;

@RestController
@RequestMapping("/habitaciones/imagenes")
public class HabitacionImagenController {

    private final HabitacionImagenService imagenService;

    public HabitacionImagenController(HabitacionImagenService imagenService) {
        this.imagenService = imagenService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> subirImagen(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imagenService.subirImagen(file));
    }

    @DeleteMapping
    public ResponseEntity<Void> eliminarImagen(@RequestBody ImagenRequestDTO dto) {
        imagenService.eliminarImagen(dto.getImagenUrl());
        return ResponseEntity.noContent().build();
    }
}
