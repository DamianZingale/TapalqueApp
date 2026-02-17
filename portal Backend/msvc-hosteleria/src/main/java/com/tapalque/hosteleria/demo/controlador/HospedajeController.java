package com.tapalque.hosteleria.demo.controlador;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.hosteleria.demo.dto.DisponibilidadResponseDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.servicio.HospedajeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/hospedajes")
public class HospedajeController {


    private final HospedajeService hospedajeService;

    public HospedajeController(HospedajeService hospedajeService) {
        this.hospedajeService = hospedajeService;
    }

    @GetMapping
    public List<HospedajeDTO> listarHospedajes() {
        return hospedajeService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospedajeDTO> obtenerPorId(@PathVariable Long id) {
        return hospedajeService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<HospedajeDTO> crearHospedaje(@Valid @RequestBody HospedajeRequestDTO dto) {
        HospedajeDTO guardado = hospedajeService.guardar(dto);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospedajeDTO> actualizarHospedaje(
            @PathVariable Long id,
            @Valid @RequestBody HospedajeRequestDTO dto) {
                return hospedajeService.actualizarHospedaje(id, dto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HospedajeDTO> patchHospedaje(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body) {
        try {
            HospedajeDTO updated = null;

            if (body.containsKey("lastCloseDate")) {
                java.time.LocalDateTime lastCloseDate = java.time.LocalDateTime.parse(
                        body.get("lastCloseDate").toString(),
                        java.time.format.DateTimeFormatter.ISO_DATE_TIME);
                updated = hospedajeService.updateLastCloseDate(id, lastCloseDate);
            }

            if (updated == null) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(updated);
        } catch (jakarta.persistence.EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHospedaje(@PathVariable Long id) {
        return hospedajeService.eliminarPorId(id);
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<DisponibilidadResponseDTO> consultarDisponibilidad(
            @PathVariable @NonNull Long id,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) Integer personas) {
        DisponibilidadResponseDTO resultado = hospedajeService.consultarDisponibilidad(
                id, fechaInicio, fechaFin, personas);
        return ResponseEntity.ok(resultado);
    }
}