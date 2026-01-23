package com.tapalque.hosteleria.demo.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.hosteleria.demo.dto.ImagenRequestDTO;
import com.tapalque.hosteleria.demo.dto.ImagenResponseDTO;
import com.tapalque.hosteleria.demo.servicio.HospedajeImagenService;

@RestController
@RequestMapping("/hospedajes")
@CrossOrigin(origins = "*")
public class HospedajeImagenController {

   
    private final HospedajeImagenService imagenService;
    public HospedajeImagenController(@Autowired HospedajeImagenService imagenService) {
        this.imagenService = imagenService;
    }


    @PostMapping(value = "/{hospedajeId}/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImagenResponseDTO> agregarImagen(
            @PathVariable Long hospedajeId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("📸 Imagen recibida para hospedaje ID: " + hospedajeId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imagenService.agregarImagen(hospedajeId, file));
    }

    /**
     * Listar imágenes de un hospedaje
     */
    @GetMapping("/{hospedajeId}/imagenes")
    public ResponseEntity<List<ImagenResponseDTO>> listarImagenes(@PathVariable Long hospedajeId) {
        return ResponseEntity.ok(imagenService.listarImagenes(hospedajeId));
    }

    /**
     * Eliminar imagen de un hospedaje
     */
    @DeleteMapping("/{hospedajeId}/imagenes")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable Long hospedajeId,
            @RequestBody ImagenRequestDTO dto) {
        imagenService.eliminarImagen(hospedajeId, dto);
        return ResponseEntity.noContent().build();
    }
}
