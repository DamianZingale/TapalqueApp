package com.tapalque.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.user.dto.HomeConfigDTO;
import com.tapalque.user.enu.SectionType;
import com.tapalque.user.service.HomeConfigService;
import com.tapalque.user.service.HomeImageService;

@RestController
@RequestMapping("/home-config")
public class HomeConfigController {

    private final HomeConfigService homeConfigService;
    private final HomeImageService homeImageService;

    public HomeConfigController(HomeConfigService homeConfigService, HomeImageService homeImageService) {
        this.homeConfigService = homeConfigService;
        this.homeImageService = homeImageService;
    }

    /**
     * Obtiene todas las configuraciones del home (público)
     */
    @GetMapping
    public ResponseEntity<List<HomeConfigDTO>> getAllConfigs() {
        try {
            List<HomeConfigDTO> configs = homeConfigService.getAllConfigs();
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene solo las configuraciones activas (para el frontend público)
     */
    @GetMapping("/active")
    public ResponseEntity<List<HomeConfigDTO>> getActiveConfigs() {
        try {
            List<HomeConfigDTO> configs = homeConfigService.getActiveConfigs();
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene la configuración de una sección específica
     */
    @GetMapping("/seccion/{seccion}")
    public ResponseEntity<?> getConfigBySeccion(@PathVariable String seccion) {
        try {
            SectionType sectionType = SectionType.valueOf(seccion.toUpperCase());
            HomeConfigDTO config = homeConfigService.getConfigBySeccion(sectionType);
            if (config != null) {
                return ResponseEntity.ok(config);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Sección inválida", seccion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al obtener configuración", e.getMessage()));
        }
    }

    /**
     * Actualiza la configuración de una sección (solo moderador)
     */
    @PutMapping("/seccion/{seccion}")
    public ResponseEntity<?> updateConfig(
            @PathVariable String seccion,
            @RequestBody HomeConfigDTO dto) {
        try {
            SectionType sectionType = SectionType.valueOf(seccion.toUpperCase());

            // Si se está actualizando la URL de la imagen, eliminar la imagen anterior
            if (dto.getImagenUrl() != null) {
                HomeConfigDTO currentConfig = homeConfigService.getConfigBySeccion(sectionType);
                if (currentConfig != null && currentConfig.getImagenUrl() != null
                        && !currentConfig.getImagenUrl().equals(dto.getImagenUrl())) {
                    // Solo eliminar si la imagen anterior era del servidor (no URL externa)
                    if (currentConfig.getImagenUrl().contains("/uploads/")) {
                        homeImageService.eliminarImagen(currentConfig.getImagenUrl());
                    }
                }
            }

            HomeConfigDTO updated = homeConfigService.updateConfig(sectionType, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al actualizar configuración", e.getMessage()));
        }
    }

    /**
     * Actualiza la configuración por ID (solo moderador)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateConfigById(
            @PathVariable Long id,
            @RequestBody HomeConfigDTO dto) {
        try {
            // Si se está actualizando la URL de la imagen, eliminar la imagen anterior
            if (dto.getImagenUrl() != null) {
                // Obtener configuración actual
                List<HomeConfigDTO> allConfigs = homeConfigService.getAllConfigs();
                HomeConfigDTO currentConfig = allConfigs.stream()
                        .filter(c -> c.getId().equals(id))
                        .findFirst()
                        .orElse(null);

                if (currentConfig != null && currentConfig.getImagenUrl() != null
                        && !currentConfig.getImagenUrl().equals(dto.getImagenUrl())) {
                    // Solo eliminar si la imagen anterior era del servidor (no URL externa)
                    if (currentConfig.getImagenUrl().contains("/uploads/")) {
                        homeImageService.eliminarImagen(currentConfig.getImagenUrl());
                    }
                }
            }

            HomeConfigDTO updated = homeConfigService.updateConfigById(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al actualizar configuración", e.getMessage()));
        }
    }

    /**
     * Sube una imagen para una sección del home (solo moderador)
     */
    @PostMapping("/seccion/{seccion}/imagen")
    public ResponseEntity<?> uploadImage(
            @PathVariable String seccion,
            @RequestParam("file") MultipartFile file) {
        try {
            SectionType sectionType = SectionType.valueOf(seccion.toUpperCase());

            // Obtener configuración actual para eliminar imagen anterior si existe
            HomeConfigDTO currentConfig = homeConfigService.getConfigBySeccion(sectionType);
            String imagenAnterior = null;
            if (currentConfig != null && currentConfig.getImagenUrl() != null) {
                imagenAnterior = currentConfig.getImagenUrl();
            }

            // Guardar la nueva imagen
            String imagenUrl = homeImageService.guardarImagen(file, seccion);

            // Eliminar imagen anterior del servidor si existía
            if (imagenAnterior != null && !imagenAnterior.isEmpty()) {
                homeImageService.eliminarImagen(imagenAnterior);
            }

            // Actualizar la configuración con la nueva URL
            HomeConfigDTO dto = new HomeConfigDTO();
            dto.setImagenUrl(imagenUrl);
            HomeConfigDTO updated = homeConfigService.updateConfig(sectionType, dto);

            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("Error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error("Error al subir imagen", e.getMessage()));
        }
    }

    private Map<String, String> error(String mensaje, String detalle) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("error", mensaje);
        errorMap.put("detalle", detalle);
        return errorMap;
    }
}
