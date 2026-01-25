package com.tapalque.hosteleria.demo.controlador;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.hosteleria.demo.dto.HabitacionDTO;
import com.tapalque.hosteleria.demo.dto.HabitacionRequestDTO;
import com.tapalque.hosteleria.demo.servicio.HabitacionService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }


    @GetMapping("/hospedajes/{hospedajeId}")
    public ResponseEntity<List<HabitacionDTO>> listarPorHospedaje(@PathVariable @NonNull Long hospedajeId) {
        try {
            List<HabitacionDTO> habitaciones = habitacionService.obtenerPorHospedaje(hospedajeId);
            return ResponseEntity.ok(habitaciones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST /api/hospedajes/{hospedajeId}/habitaciones
    @PostMapping("/hospedajes/{hospedajeId}")
    public ResponseEntity<HabitacionDTO> crear(
            @PathVariable @NonNull Long hospedajeId,
            @Valid @RequestBody HabitacionRequestDTO dto) {
        try {
            HabitacionDTO creada = habitacionService.crear(hospedajeId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/habitaciones/{id}
    @GetMapping("/{id}")
    public ResponseEntity<HabitacionDTO> obtenerPorId(@PathVariable @NonNull Long id) {
        try {
            HabitacionDTO habitacion = habitacionService.obtenerPorId(id);
            return ResponseEntity.ok(habitacion);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

 
    @PutMapping("/{id}")
    public ResponseEntity<HabitacionDTO> actualizar(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody HabitacionRequestDTO dto) {
        try {
            HabitacionDTO actualizada = habitacionService.actualizar(id, dto);
            return ResponseEntity.ok(actualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @NonNull Long id) {
        try {
            habitacionService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PatchMapping("/habitaciones/{id}/disponibilidad")
    public ResponseEntity<HabitacionDTO> cambiarDisponibilidad(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            Boolean disponible = payload.get("disponible");
            if (disponible == null) {
                return ResponseEntity.badRequest().build();
            }
            HabitacionDTO actualizada = habitacionService.cambiarDisponibilidad(id, disponible);
            return ResponseEntity.ok(actualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
