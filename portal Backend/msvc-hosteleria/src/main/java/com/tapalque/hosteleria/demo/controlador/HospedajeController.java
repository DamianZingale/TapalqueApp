package com.tapalque.hosteleria.demo.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.servicio.HospedajeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/hospedajes")
@CrossOrigin(origins = "*") // permitir requests del frontend
public class HospedajeController {

    @Autowired
    private HospedajeService hospedajeService;

    // Obtener todos los hospedajes
    @GetMapping
    public List<HospedajeDTO> listarHospedajes() {
        return hospedajeService.obtenerTodos();
    }

    // Obtener hospedaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<HospedajeDTO> obtenerPorId(@PathVariable Long id) {
        return hospedajeService.obtenerPorId(id);
    }

    // Crear nuevo hospedaje
    @PostMapping
    public ResponseEntity<HospedajeDTO> crearHospedaje(@Valid @RequestBody HospedajeRequestDTO dto) {
        HospedajeDTO guardado = hospedajeService.guardar(dto);
        return ResponseEntity.ok(guardado);
    }

    // Actualizar hospedaje existente
    @PutMapping("/{id}")
    public ResponseEntity<HospedajeDTO> actualizarHospedaje(
            @PathVariable Long id,
            @Valid @RequestBody HospedajeRequestDTO dto) {
                return hospedajeService.actualizarHospedaje(id, dto);
    }

    // Eliminar hospedaje por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHospedaje(@PathVariable Long id) {
        return hospedajeService.eliminarPorId(id);
    }
}