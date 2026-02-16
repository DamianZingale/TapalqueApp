package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.BusinessDTO;
import com.tapalque.user.dto.BusinessRequestDTO;
import com.tapalque.user.service.BusinessService;



@RestController
@RequestMapping("/business")
public class BusinessController {

    private final BusinessService businessService;
    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MODERADOR')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BusinessDTO>> getBusinessesByUserId(@PathVariable Long userId) {
        List<BusinessDTO> businesses = businessService.getBusinessesByUserId(userId);
        return ResponseEntity.ok(businesses);
    }

    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MODERADOR')")
    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessDTO> getBusinessById(@PathVariable Long businessId) {
        BusinessDTO business = businessService.getBusinessById(businessId);
        if (business != null) {
            return ResponseEntity.ok(business);
        }
        return ResponseEntity.notFound().build();
    }

    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MODERADOR')")
    @GetMapping("/external/{externalBusinessId}/type/{businessType}")
    public ResponseEntity<BusinessDTO> getBusinessByExternalIdAndType(
            @PathVariable Long externalBusinessId,
            @PathVariable String businessType) {
        BusinessDTO business = businessService.getBusinessByExternalIdAndType(externalBusinessId, businessType);
        if (business != null) {
            return ResponseEntity.ok(business);
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== MODERADOR ENDPOINTS ====================

    // @PreAuthorize("hasRole('MODERADOR')")
    @GetMapping("/all")
    public ResponseEntity<List<BusinessDTO>> getAllBusinesses() {
        try {
            List<BusinessDTO> businesses = businessService.getAllBusinesses();
            return ResponseEntity.ok(businesses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @PreAuthorize("hasRole('MODERADOR')")
    @PostMapping
    public ResponseEntity<?> assignBusinessToAdmin(@RequestBody BusinessRequestDTO dto) {
        try {
            BusinessDTO business = businessService.assignBusinessToAdmin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(business);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al asignar negocio", e.getMessage()));
        }
    }

    // @PreAuthorize("hasRole('MODERADOR')")
    @PatchMapping("/{businessId}/owner")
    public ResponseEntity<?> changeBusinessOwner(
            @PathVariable Long businessId,
            @RequestBody Map<String, Long> payload) {
        try {
            Long newOwnerId = payload.get("ownerId");
            if (newOwnerId == null) {
                return ResponseEntity.badRequest()
                        .body(error("Error", "El ID del nuevo propietario es obligatorio"));
            }

            BusinessDTO updated = businessService.changeBusinessOwner(businessId, newOwnerId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al cambiar propietario", e.getMessage()));
        }
    }

    @DeleteMapping("/external/{externalBusinessId}/type/{businessType}")
    public ResponseEntity<?> removeByExternalIdAndType(
            @PathVariable Long externalBusinessId,
            @PathVariable String businessType) {
        try {
            businessService.removeByExternalIdAndType(externalBusinessId, businessType);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al eliminar asignación", e.getMessage()));
        }
    }

    // @PreAuthorize("hasRole('MODERADOR')")
    @DeleteMapping("/{businessId}")
    public ResponseEntity<?> removeBusinessAssignment(@PathVariable Long businessId) {
        try {
            businessService.removeBusinessAssignment(businessId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al eliminar asignación", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("detalle", detalle);
        return error;
    }
}
