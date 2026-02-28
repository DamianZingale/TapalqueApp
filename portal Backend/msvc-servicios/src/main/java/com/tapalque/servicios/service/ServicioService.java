package com.tapalque.servicios.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.servicios.Exceptions.ServicioNotFoundException;
import com.tapalque.servicios.dto.ServicioRequestDTO;
import com.tapalque.servicios.dto.ServicioResponseDTO;
import com.tapalque.servicios.entity.Servicio;
import com.tapalque.servicios.repository.ServicioRepository;

@Service
@Transactional(readOnly = true )
public class ServicioService {
    @Autowired
    private ServicioRepository servicioRepository;

    @CacheEvict(value = "servicios", allEntries = true)
    @Transactional
    public ServicioResponseDTO crear(ServicioRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del servicio es obligatorio");
        }

        Servicio servicio = new Servicio(dto);
        servicioRepository.save(servicio);
        return new ServicioResponseDTO(servicio);
    }

    @Cacheable(value = "servicios")
    public List<ServicioResponseDTO> obtenerTodos() {
        return servicioRepository.findAll()
                .stream()
                .map(ServicioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "servicios", key = "#id")
    public ServicioResponseDTO obtenerPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        return new ServicioResponseDTO(servicio);
    }

    @CacheEvict(value = "servicios", allEntries = true)
    @Transactional
    public ServicioResponseDTO actualizarCompleto(Long id, ServicioRequestDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        // Se actualiza sobre la entidad existente para preservar las imagenes asociadas.
        // No crear entidad nueva: con orphanRemoval=true borraría todas las imágenes.
        servicio.setTitulo(dto.getTitulo());
        servicio.setDescripcion(dto.getDescripcion());
        servicio.setDireccion(dto.getDireccion());
        servicio.setHorario(dto.getHorario());
        servicio.setTelefono(dto.getTelefono());
        servicio.setLatitud(dto.getLatitud());
        servicio.setLongitud(dto.getLongitud());
        servicio.setFacebook(dto.getFacebook());
        servicio.setInstagram(dto.getInstagram());
        servicio.setTag(dto.getTag() != null ? dto.getTag().toUpperCase() : null);
        servicioRepository.save(servicio);
        return new ServicioResponseDTO(servicio);
    }

    @CacheEvict(value = "servicios", allEntries = true)
    @Transactional
    public ServicioResponseDTO actualizarParcial(Long id, ServicioRequestDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        servicio.actualizarParcial(dto);
        servicioRepository.save(servicio);
        return new ServicioResponseDTO(servicio);
    }

    @CacheEvict(value = "servicios", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        servicioRepository.delete(servicio);
    }
}
