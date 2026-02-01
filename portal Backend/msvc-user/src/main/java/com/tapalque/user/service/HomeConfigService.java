package com.tapalque.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.user.dto.HomeConfigDTO;
import com.tapalque.user.entity.HomeConfig;
import com.tapalque.user.enu.SectionType;
import com.tapalque.user.repository.HomeConfigRepository;

@Service
public class HomeConfigService {

    private final HomeConfigRepository homeConfigRepository;

    public HomeConfigService(HomeConfigRepository homeConfigRepository) {
        this.homeConfigRepository = homeConfigRepository;
    }

    public List<HomeConfigDTO> getAllConfigs() {
        return homeConfigRepository.findAll()
                .stream()
                .map(HomeConfigDTO::new)
                .collect(Collectors.toList());
    }

    public List<HomeConfigDTO> getActiveConfigs() {
        return homeConfigRepository.findByActivoTrue()
                .stream()
                .map(HomeConfigDTO::new)
                .collect(Collectors.toList());
    }

    public HomeConfigDTO getConfigBySeccion(SectionType seccion) {
        return homeConfigRepository.findBySeccion(seccion)
                .map(HomeConfigDTO::new)
                .orElse(null);
    }

    @Transactional
    public HomeConfigDTO updateConfig(SectionType seccion, HomeConfigDTO dto) {
        HomeConfig config = homeConfigRepository.findBySeccion(seccion)
                .orElseGet(() -> {
                    HomeConfig newConfig = new HomeConfig();
                    newConfig.setSeccion(seccion);
                    return newConfig;
                });

        if (dto.getImagenUrl() != null) {
            config.setImagenUrl(dto.getImagenUrl());
        }
        if (dto.getTitulo() != null) {
            config.setTitulo(dto.getTitulo());
        }
        if (dto.getActivo() != null) {
            config.setActivo(dto.getActivo());
        }
        config.setUpdatedAt(LocalDateTime.now());

        HomeConfig saved = homeConfigRepository.save(config);
        return new HomeConfigDTO(saved);
    }

    @Transactional
    public HomeConfigDTO updateConfigById(Long id, HomeConfigDTO dto) {
        HomeConfig config = homeConfigRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuración no encontrada con ID: " + id));

        if (dto.getImagenUrl() != null) {
            config.setImagenUrl(dto.getImagenUrl());
        }
        if (dto.getTitulo() != null) {
            config.setTitulo(dto.getTitulo());
        }
        if (dto.getActivo() != null) {
            config.setActivo(dto.getActivo());
        }
        config.setUpdatedAt(LocalDateTime.now());

        HomeConfig saved = homeConfigRepository.save(config);
        return new HomeConfigDTO(saved);
    }

    @Transactional
    public void initializeDefaultConfigs() {
        for (SectionType seccion : SectionType.values()) {
            if (homeConfigRepository.findBySeccion(seccion).isEmpty()) {
                HomeConfig config = new HomeConfig();
                config.setSeccion(seccion);
                config.setTitulo(getDefaultTitle(seccion));
                config.setActivo(true);
                homeConfigRepository.save(config);
            }
        }
    }

    private String getDefaultTitle(SectionType seccion) {
        switch (seccion) {
            case COMERCIO:
                return "Comercios";
            case GASTRONOMIA:
                return "Gastronomía";
            case HOSPEDAJE:
                return "Hospedajes";
            case SERVICIOS:
                return "Servicios";
            case ESPACIOS:
                return "Espacios Públicos";
            case EVENTOS:
                return "Eventos";
            case TERMAS:
                return "Termas";
            default:
                return seccion.name();
        }
    }
}
