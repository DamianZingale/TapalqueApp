package com.tapalque.gastronomia.demo.Controller;

import com.tapalque.gastronomia.demo.DTO.SaborHeladeriaDTO;
import com.tapalque.gastronomia.demo.Service.SaborHeladeriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gastronomia/heladeria")
public class SaborHeladeriaController {

    private final SaborHeladeriaService saborService;

    public SaborHeladeriaController(SaborHeladeriaService saborService) {
        this.saborService = saborService;
    }

    /** Todos los sabores de una heladería (para el panel admin) */
    @GetMapping("/{restaurantId}/sabores")
    public ResponseEntity<List<SaborHeladeriaDTO>> getSabores(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(saborService.getSaboresByRestaurant(restaurantId));
    }

    /** Solo los sabores habilitados (para los usuarios) */
    @GetMapping("/{restaurantId}/sabores/habilitados")
    public ResponseEntity<List<SaborHeladeriaDTO>> getSaboresHabilitados(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(saborService.getSaboresHabilitados(restaurantId));
    }

    /** Crear un nuevo sabor */
    @PostMapping("/{restaurantId}/sabores")
    public ResponseEntity<SaborHeladeriaDTO> crearSabor(
            @PathVariable Long restaurantId,
            @RequestBody Map<String, String> body) {
        String nombre = body.get("nombre");
        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(saborService.crearSabor(restaurantId, nombre.trim()));
    }

    /** Actualizar nombre y/o estado habilitado de un sabor */
    @PutMapping("/sabores/{saborId}")
    public ResponseEntity<SaborHeladeriaDTO> actualizarSabor(
            @PathVariable Long saborId,
            @RequestBody Map<String, Object> body) {
        String nombre = (String) body.get("nombre");
        Boolean habilitado = body.get("habilitado") instanceof Boolean ? (Boolean) body.get("habilitado") : null;
        return ResponseEntity.ok(saborService.actualizarSabor(saborId, nombre, habilitado));
    }

    /** Alternar estado habilitado de un sabor */
    @PatchMapping("/sabores/{saborId}/habilitado")
    public ResponseEntity<SaborHeladeriaDTO> toggleHabilitado(@PathVariable Long saborId) {
        return ResponseEntity.ok(saborService.toggleHabilitado(saborId));
    }

    /** Eliminar un sabor */
    @DeleteMapping("/sabores/{saborId}")
    public ResponseEntity<Void> eliminarSabor(@PathVariable Long saborId) {
        saborService.eliminarSabor(saborId);
        return ResponseEntity.noContent().build();
    }
}
