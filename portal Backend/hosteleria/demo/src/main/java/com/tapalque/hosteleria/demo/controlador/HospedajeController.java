package com.tapalque.hosteleria.demo.controlador;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;
import com.tapalque.hosteleria.demo.servicio.HospedajeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hospedajes")
@CrossOrigin(origins = "*") // permitir requests del frontend
public class HospedajeController {

    @Autowired
    private HospedajeService hospedajeService;

    // 🔹 Obtener todos los hospedajes
    @GetMapping
    public List<HospedajeDTO> listarHospedajes() {
        return hospedajeService.obtenerTodos().stream()
                .map(HospedajeDTO::new)
                .collect(Collectors.toList());
    }

    // 🔹 Obtener hospedaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<HospedajeDTO> obtenerPorId(@PathVariable Long id) {
        Optional<Hospedaje> hospedaje = hospedajeService.obtenerPorId(id);
        return hospedaje.map(value -> ResponseEntity.ok(new HospedajeDTO(value)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Crear nuevo hospedaje
    @PostMapping
    public ResponseEntity<HospedajeDTO> crearHospedaje(@Valid @RequestBody HospedajeRequestDTO dto) {
        Hospedaje hospedaje = mapToEntity(dto);
        Hospedaje guardado = hospedajeService.guardar(hospedaje);
        return ResponseEntity.ok(new HospedajeDTO(guardado));
    }

    
    // 🔄 Actualizar hospedaje existente
@PutMapping("/{id}")
public ResponseEntity<HospedajeDTO> actualizarHospedaje(
        @PathVariable Long id,
        @Valid @RequestBody HospedajeRequestDTO dto) {

    Optional<Hospedaje> existente = hospedajeService.obtenerPorId(id);
    if (existente.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Hospedaje hospedaje = existente.get();

    // Actualizá los campos
    hospedaje.setTitulo(dto.getTitulo());
    hospedaje.setDescription(dto.getDescription());
    hospedaje.setUbicacion(dto.getUbicacion());
    hospedaje.setGoogleMapsUrl(dto.getGoogleMapsUrl());
    hospedaje.setNumWhatsapp(dto.getNumWhatsapp());
    hospedaje.setTipoHospedaje(dto.getTipoHospedaje());

    // Limpiar y actualizar las imágenes
    hospedaje.getImagenes().clear();
    if (dto.getImagenes() != null) {
        List<HospedajeImagen> nuevasImagenes = dto.getImagenes().stream().map(url -> {
            HospedajeImagen img = new HospedajeImagen();
            img.setImagenUrl(url);
            img.setHospedaje(hospedaje);
            return img;
        }).collect(Collectors.toList());
        hospedaje.getImagenes().addAll(nuevasImagenes);
    }

    Hospedaje actualizado = hospedajeService.guardar(hospedaje);
    return ResponseEntity.ok(new HospedajeDTO(actualizado));
}

    // Método para mapear de DTO a Entidad
    private Hospedaje mapToEntity(HospedajeRequestDTO dto) {
        Hospedaje hospedaje = new Hospedaje();
        hospedaje.setTitulo(dto.getTitulo());
        hospedaje.setDescription(dto.getDescription());
        hospedaje.setUbicacion(dto.getUbicacion());
        hospedaje.setGoogleMapsUrl(dto.getGoogleMapsUrl());
        hospedaje.setNumWhatsapp(dto.getNumWhatsapp());
        hospedaje.setTipoHospedaje(dto.getTipoHospedaje());

        // Carga imágenes si hay URLs
        if (dto.getImagenes() != null) {
            List<HospedajeImagen> imagenes = dto.getImagenes().stream().map(url -> {
                HospedajeImagen img = new HospedajeImagen();
                img.setImagenUrl(url);
                img.setHospedaje(hospedaje); // importante para la relación bidireccional
                return img;
            }).collect(Collectors.toList());
            hospedaje.setImagenes(imagenes);
        }

        return hospedaje;
    }
}