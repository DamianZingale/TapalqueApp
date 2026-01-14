package com.tapalque.user.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.user.dto.BusinessDTO;
import com.tapalque.user.service.BusinessService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/business")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    /**
     * Obtiene todos los negocios de un usuario (administrador)
     */
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MODERADOR')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BusinessDTO>> getBusinessesByUserId(@PathVariable Long userId) {
        List<BusinessDTO> businesses = businessService.getBusinessesByUserId(userId);
        return ResponseEntity.ok(businesses);
    }

    /**
     * Obtiene un negocio por ID
     */
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'MODERADOR')")
    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessDTO> getBusinessById(@PathVariable Long businessId) {
        BusinessDTO business = businessService.getBusinessById(businessId);
        if (business != null) {
            return ResponseEntity.ok(business);
        }
        return ResponseEntity.notFound().build();
    }
}
